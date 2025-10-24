// src/routes/facultyRoutes.js
import express from "express";
import {
  updateAvailability,
  getFacultyAvailability,
  getAllFaculty,
  getFacultyTimetable // optional: for admin dashboard or future use
} from "../controllers/facultyController.js";
import { protect } from "../middleware/authmiddleware.js";


const router = express.Router();

/**
 * @route   POST /api/faculty/availability
 * @desc    Update faculty availability status
 * @access  Private (Faculty only)
 */
router.post("/availability", protect, updateAvailability);


/**
 * @route   GET /api/faculty/availability
 * @desc    Get current faculty availability (self or all)
 * @access  Private
 */
router.get("/availability", protect , getFacultyAvailability);
router.get("/timetable", protect , getFacultyTimetable);
/**
 * @route   GET /api/faculty/all
 * @desc    Get all faculty with their current status
 * @access  Admin
 */
router.get("/all", protect, getAllFaculty);

export default router;
