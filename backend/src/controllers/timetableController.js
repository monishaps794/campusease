// backend/src/controllers/timetableController.js
import Timetable from "../models/Timetable.js";
import AllocationResult from "../models/AllocationResult.js";

const LAB_ROOM = "ISELAB1";
const isLab = (t) => (t || "").toUpperCase().includes("LAB");
const isActivity = (t) => ["ACTIVITY", "NO_ROOM"].includes((t || "").toUpperCase());

export const getMergedDay = async (req, res) => {
  try {
    let { branch, year, section, day } = req.params;

    branch = branch.toUpperCase();
    year = year.toString();
    section = section.toUpperCase();
    day = day.toUpperCase(); // <-- FIX

    // Case-insensitive DB lookup
    const tt = await Timetable.findOne({
      branch,
      year,
      section,
      day: { $regex: `^${day}$`, $options: "i" }
    }).lean();

    if (!tt) return res.json({ success: true, slots: [] });

    // Fetch latest allocation
    const latest = await AllocationResult.findOne().sort({ createdAt: -1 }).lean();
    const allocation = latest?.allocation || {};
    const secKey = `${year}${section}`; // "3A", "5B", etc.
    const allocList = allocation[secKey] || [];

    // Index allocation by (day + slot)
    const allocIndex = new Map();
    for (const a of allocList) {
      allocIndex.set(`${a.day.toUpperCase()}__${a.slot}`, a.room || a.roomNumber || null);
    }

    // Merge timetable + rooms
    const out = (tt.slots || []).map((s) => {
      const time = s.timeSlot;
      const type = s.type;
      const baseKey = `${tt.day.toUpperCase()}__${time}`;

      let room = null;

      if (isLab(type)) {
        room = LAB_ROOM;
      } else if (isActivity(type)) {
        room = null; // Activity doesn't require room
      } else {
        room = allocIndex.get(baseKey) ?? s.classroom ?? null;
      }

      return {
        time,
        subject: s.subjectName,
        faculty: s.facultyName,
        type,
        classroom: room
      };
    });

    return res.json({ success: true, slots: out });
  } catch (err) {
    console.error("getMergedDay error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

