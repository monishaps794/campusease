import Timetable from "../models/Timetable.js";

// -------------------- SELECT SECTION --------------------
export const selectSection = async (req, res) => {
  try {
    const { branch, year, section } = req.body;
    const user = req.user;

    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can perform this action" });
    }

    if (user.sectionSelected) {
      return res.status(400).json({ message: "Section already selected" });
    }

    user.branch = branch;
    user.year = year;
    user.section = section;
    user.sectionSelected = true;

    await user.save();

    return res.json({ user });
  } catch (err) {
    console.error("Error in selectSection:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- GET TODAY'S TIMETABLE --------------------
export const getTodaysTimetable = async (req, res) => {
  try {
    const user = req.user;
    let { day } = req.query;

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (!day) {
      const idx = new Date().getDay();
      day = weekdays[idx];
    }

    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can perform this action" });
    }

    if (!user.sectionSelected) {
      return res.status(400).json({ message: "Please select your section first" });
    }

    const timetable = await Timetable.findOne({
      branch: user.branch,
      year: user.year,
      section: user.section,
    });

    if (!timetable) {
      return res.json({ [day]: [] });
    }

    return res.json({ [day]: timetable.schedule[day] || [] });
  } catch (err) {
    console.error("Error in getTodaysTimetable:", err);
    res.status(500).json({ message: "Server error" });
  }
};
