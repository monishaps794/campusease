// backend/src/routes/timetableRoutes.js
import express from "express";
import { getTimetableForSectionDay } from "../controllers/timetableController.js";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// POST /timetable/upload
router.post("/upload", async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "Array required" });
    }

    
    await Timetable.deleteMany({}); // clear all old timetables
    const inserted = await Timetable.insertMany(data);
    res.json({ success: true, count: inserted.length });
  } catch (err) {
    console.error("Timetable upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /timetable/:branch/:year/:section/:day
router.get("/:branch/:year/:section/:day", getTimetableForSectionDay);
//router.get("/:branch/:year/:section/week", getWeeklyTimetable);


export default router;