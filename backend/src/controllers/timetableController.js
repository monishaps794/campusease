import asyncHandler from "express-async-handler";
import TimetableEntry from "../models/TimetableEntry.js";
import User from "../models/User.js";
import Room from "../models/Room.js";

// 🗓️ Create timetable entry
export const createTimetableEntry = asyncHandler(async (req, res) => {
  const {
    branch,
    semester,
    section,
    dayOfWeek,
    periodIndex,
    subject,
    facultyId,
    roomId,
    startTime,
    endTime,
  } = req.body;

  // 🔍 Validate required fields
  if (
    !branch ||
    !semester ||
    !section ||
    !dayOfWeek ||
    !periodIndex ||
    !subject ||
    !facultyId ||
    !roomId ||
    !startTime ||
    !endTime
  ) {
    return res
      .status(400)
      .json({ message: "All fields including startTime and endTime are required." });
  }

  // 🧩 Validate faculty and room existence
  const faculty = await User.findById(facultyId);
  const room = await Room.findById(roomId);

  if (!faculty) return res.status(404).json({ message: "Faculty not found." });
  if (!room) return res.status(404).json({ message: "Room not found." });

  // 🕒 Validate time format (HH:mm)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return res
      .status(400)
      .json({ message: "Start and end times must be in HH:mm format (e.g., 09:00)." });
  }

  // 🚫 Prevent duplicate timetable entries for same period
  const existingEntry = await TimetableEntry.findOne({
    branch: branch.toUpperCase(),
    semester,
    section: section.toUpperCase(),
    dayOfWeek,
    periodIndex,
  });

  if (existingEntry) {
    return res
      .status(409)
      .json({ message: "A timetable entry for this period already exists." });
  }

  // ✅ Create the new timetable entry
  const entry = await TimetableEntry.create({
    branch: branch.toUpperCase(),
    semester,
    section: section.toUpperCase(),
    dayOfWeek,
    periodIndex,
    subject,
    facultyId,
    roomId,
    startTime,
    endTime,
  });

  res.status(201).json({
    message: "Timetable entry created successfully.",
    entry,
  });
});

// 📖 Get timetable by branch, semester, section
export const getTimetable = asyncHandler(async (req, res) => {
  const { branch, semester, section } = req.params;

  if (!branch || !semester || !section) {
    return res.status(400).json({ message: "Branch, semester, and section are required." });
  }

  const timetable = await TimetableEntry.find({
    branch: branch.toUpperCase(),
    semester,
    section: section.toUpperCase(),
  })
    .populate("facultyId", "name email role")
    .populate("roomId", "name location type capacity")
    .sort({ dayOfWeek: 1, periodIndex: 1 });

  if (!timetable.length) {
    return res.status(404).json({ message: "No timetable found for the given details." });
  }

  res.status(200).json(timetable);
});

// 🗑️ Delete timetable entry by ID (for admin use)
export const deleteTimetableEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await TimetableEntry.findById(id);
  if (!entry) {
    return res.status(404).json({ message: "Timetable entry not found." });
  }

  await entry.deleteOne();
  res.json({ message: "Timetable entry deleted successfully." });
});
