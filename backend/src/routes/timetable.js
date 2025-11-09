// backend/src/routes/timetable.js
import express from "express";
import { getMergedDay } from "../controllers/timetableController.js";
import { getFacultyTimetable } from "../controllers/facultyTimetableController.js";
import { getSectionTimetable } from "../controllers/studentTimetableController.js";

const router = express.Router();

// Final merged timetable endpoint (used by admin)
router.get("/merged/:branch/:year/:section/:day", getMergedDay);

// Faculty CSV view
router.get("/faculty/:facultyName", getFacultyTimetable);

// ✅ NEW: Student section full-week CSV view
router.get("/section/:branch/:year/:section", getSectionTimetable);

export default router;
