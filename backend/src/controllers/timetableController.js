// backend/controllers/timetableController.js
import asyncHandler from "express-async-handler";
import Timetable from "../models/Timetable.js";

// Utility to get today's day name
const getDayName = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
};

// 📅 GET /api/timetable/:branch/:semester/:section/:day
export const getTimetableBySection = asyncHandler(async (req, res) => {
  const { branch, semester, section, day } = req.params;

  const timetable = await Timetable.find({
    branch,
    semester,
    section,
    day: { $regex: new RegExp(day, "i") },
  }).populate("facultyId", "name email");

  if (!timetable.length) {
    return res.status(404).json({ message: "No timetable found" });
  }

  res.json(timetable);
});

// 📅 GET /api/timetable/:branch/:semester/:section (today)
export const getTodayTimetable = asyncHandler(async (req, res) => {
  const { branch, semester, section } = req.params;
  const today = getDayName();

  const timetable = await Timetable.find({
    branch,
    semester,
    section,
    day: { $regex: new RegExp(today, "i") },
  }).populate("facultyId", "name email");

  if (!timetable.length) {
    return res.status(404).json({ message: "No classes scheduled today" });
  }

  res.json(timetable);
});
