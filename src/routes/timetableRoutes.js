import express from "express";
import {
  createTimetableEntry,
  getTimetable,
  deleteTimetableEntry,
} from "../controllers/timetableController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🗓️ Get timetable for branch, semester, section
router.get("/:branch/:semester/:section", auth, getTimetable);

// 🆕 Create timetable entry
router.post("/", auth, createTimetableEntry);

// 🗑️ Delete timetable entry by ID
router.delete("/:id", auth, deleteTimetableEntry);

export default router;
