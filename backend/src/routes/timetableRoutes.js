import express from "express";
import TimetableEntry from "../models/TimetableEntry.js";

const router = express.Router();

/**
 * ✅ Create timetable entry
 */
router.post("/", async (req, res) => {
  try {
    const {
      facultyId,
      branch,
      semester,
      section,
      dayOfWeek,
      periodIndex,
      subject,
      roomId,
      startTime,
      endTime,
    } = req.body;

    if (
      !facultyId ||
      !branch ||
      !semester ||
      !section ||
      !dayOfWeek ||
      !periodIndex ||
      !subject ||
      !roomId ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newEntry = new TimetableEntry({
      facultyId,
      branch,
      semester,
      section,
      dayOfWeek,
      periodIndex,
      subject,
      roomId,
      startTime,
      endTime,
    });

    await newEntry.save();
    res.status(201).json({ message: "Timetable entry created", data: newEntry });
  } catch (err) {
    console.error("❌ Error creating timetable entry:", err);
    res.status(500).json({ message: "Failed to save timetable entry", error: err.message });
  }
});

/**
 * ✅ Get timetable entries by faculty
 */
router.get("/:facultyId", async (req, res) => {
  try {
    const entries = await TimetableEntry.find({ facultyId: req.params.facultyId })
      .populate("roomId", "name")
      .sort({ dayOfWeek: 1, periodIndex: 1 });

    if (!entries.length)
      return res.status(404).json({ message: "No timetable found for this faculty" });

    res.json(entries);
  } catch (err) {
    console.error("❌ Error fetching timetable:", err);
    res.status(500).json({ message: "Error fetching timetable" });
  }
});

export default router;
