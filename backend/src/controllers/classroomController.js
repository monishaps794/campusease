// backend/src/controllers/classroomController.js
import Classroom from "../models/Classroom.js";
import Booking from "../models/Booking.js";
import Timetable from "../models/Timetable.js";

/**
 * GET /classrooms/all
 */
export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find().lean();
    return res.json({ success: true, classrooms });
  } catch (err) {
    console.error("getAllClassrooms:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /classrooms
 * body: { roomNumber, name, type, capacity, blocked }
 */
export const createClassroom = async (req, res) => {
  try {
    const { roomNumber, name, type, capacity, blocked } = req.body;
    if (!roomNumber) return res.status(400).json({ message: "roomNumber required" });
    const exists = await Classroom.findOne({ roomNumber });
    if (exists) return res.status(409).json({ message: "Classroom exists" });
    const room = await Classroom.create({ roomNumber, name, type, capacity, blocked: !!blocked });
    return res.status(201).json({ success: true, classroom: room });
  } catch (err) {
    console.error("createClassroom:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /classrooms/available?date=YYYY-MM-DD&slot=8:30-9:30&branch=&year=&section=&day=
 * - if branch/year/section/day provided, exclude rooms that are used in that section's timetable for that day+slot
 * - exclude rooms with approved booking for that date+slot
 * - exclude blocked rooms
 */
export const getAvailableClassrooms = async (req, res) => {
  try {
    const { date, slot, branch, year, section, day } = req.query;
    if (!slot) return res.status(400).json({ message: "slot is required (e.g. 8:30-9:30)" });

    // 1) rooms used by timetable for given section/day/slot
    let occupiedRoomIds = [];
    if (branch && year && section && (day || date)) {
      const dayName = day || (new Date(date + "T00:00:00")).toLocaleDateString("en-US", { weekday: "long" });
      const tts = await Timetable.find({ branch, year, section, day: dayName }).lean();
      for (const tt of tts) {
        for (const s of tt.slots || []) {
          if (s.timeSlot === slot && s.classroom) occupiedRoomIds.push(String(s.classroom));
        }
      }
    }

    // 2) rooms booked (approved) for that date+slot
    let bookedRoomIds = [];
    if (date) {
      const approved = await Booking.find({ date, slot, status: "approved" }).lean();
      bookedRoomIds = approved.map(b => String(b.roomId)).filter(Boolean);
    }

    const exclude = Array.from(new Set([...occupiedRoomIds, ...bookedRoomIds]));

    const query = {
      blocked: { $ne: true },
      _id: { $nin: exclude.length ? exclude : [] },
    };

    const available = await Classroom.find(query).lean();
    return res.json({ success: true, available, excluded: exclude });
  } catch (err) {
    console.error("getAvailableClassrooms:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
