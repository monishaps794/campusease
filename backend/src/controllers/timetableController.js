// backend/src/controllers/timetableController.js
import Timetable from "../models/Timetable.js";

/**
 * GET timetable by branch/year/section/day
 * Example: GET /timetable/ISE/3/A/Monday
 */
export const getTimetableForSectionDay = async (req, res) => {
  try {
    let { branch, year, section, day } = req.params;

    if (!branch || !year || !section || !day) {
      return res.status(400).json({ success: false, message: "Missing parameters: branch/year/section/day required" });
    }

    // normalize incoming values (trim + uppercase for day)
    branch = String(branch).trim();
    year = String(year).trim();
    section = String(section).trim();
    day = String(day).trim();
    // allow Monday or monday inputs: convert to Title case first-letter uppercase
    const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    // Query DB for timetables matching this section & day
    const docs = await Timetable.find({
      branch,
      year,
      section,
      day: { $in: [day, normalizedDay, normalizedDay.toUpperCase()] }, // tolerate formats
    }).lean();

    // Flatten slots for UI consumers
    const slots = [];
    for (const d of docs) {
      for (const s of d.slots || []) {
        slots.push({
          time: s.timeSlot || s.time || "",
          subject: s.subjectName || s.subject || "",
          faculty: s.facultyName || s.faculty || "",
          classroom: s.classroom || null,
          type: s.type || "Lecture",
        });
      }
    }

    return res.json({ success: true, slots });
  } catch (err) {
    console.error("getTimetableForSectionDay:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
