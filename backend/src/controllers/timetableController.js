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
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    branch = branch.trim();
    year = year.trim();
    section = section.trim();
    day = day.trim().toUpperCase(); // ALWAYS UPPERCASE (because your CSV stored MONDAY etc)

    const docs = await Timetable.find({
      branch,
      year,
      section,
      day
    }).lean();

    const slots = [];

    for (const d of docs) {
      for (const s of d.slots || []) {
        slots.push({
          time: s.timeSlot,               // <-- EXACT FIELD NAMES
          subject: s.subjectName,
          faculty: s.facultyName,
          classroom: s.classroom,
          type: s.type
        });
      }
    }

    return res.json({ success: true, slots });

  } catch (err) {
    console.error("getTimetableForSectionDay:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
