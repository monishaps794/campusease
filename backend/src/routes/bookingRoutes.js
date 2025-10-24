import express from "express";
import {
  createBooking,
  getFacultyBookings,
  deleteBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create a new booking request
router.post("/", protect, createBooking);

// ✅ Get all bookings made by a faculty (for dashboard)
router.get("/faculty/:facultyId", protect, getFacultyBookings);

// ✅ Delete a booking
router.delete("/:id", protect, deleteBooking);

export default router;
