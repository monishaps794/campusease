// backend/routes/timetableRoutes.js
import express from "express";
import {
  getTimetableBySection,
  getTodayTimetable,
} from "../controllers/timetableController.js";

const router = express.Router();

// Get timetable for a specific branch/semester/section/day
router.get("/:branch/:semester/:section/:day", getTimetableBySection);

// Get today's timetable automatically (optional use by student home)
router.get("/:branch/:semester/:section", getTodayTimetable);

export default router;
