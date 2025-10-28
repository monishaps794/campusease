import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

// ✅ Student registration
export const registerStudent = async (req, res) => {
  try {
    const { name, email, department, year, section, semester } = req.body;

    if (!name || !email || !department || !year || !section || !semester) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Student already registered with this email." });
    }

    const student = new User({
      name,
      email: email.toLowerCase().trim(),
      role: "student",
      department,
      year,
      section,
      semester,
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      user: student,
    });
  } catch (err) {
    console.error("❌ Register student error:", err);
    res.status(500).json({ message: "Server error while registering student." });
  }
};

// ✅ Fetch student profile by email
export const getStudentProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required." });

    const student = await User.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found." });

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year,
        section: student.section,
        semester: student.semester,
      },
    });
  } catch (err) {
    console.error("❌ getStudentProfile error:", err);
    res.status(500).json({ message: "Server error while fetching student profile." });
  }
};
// ✅ Update student info (optional; you can keep or remove if not using StudentSelect)
export const updateStudentInfo = async (req, res) => {
  try {
    const { department, semester, year, section } = req.body;
    const userEmail = req.user.email;

    const student = await User.findOneAndUpdate(
      { email: userEmail },
      { department, semester, year, section },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: "Student not found." });

    res.status(200).json({
      success: true,
      message: "Student info updated successfully.",
      user: student,
    });
  } catch (err) {
    console.error("❌ Update student info error:", err);
    res.status(500).json({ message: "Server error while updating student info." });
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
