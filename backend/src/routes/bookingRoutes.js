import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getBookingsForUser,
} from "../controllers/bookingsController.js";

const router = express.Router();

/**
 * @route POST /api/bookings
 * @desc Create a new room booking
 * @access Protected (Faculty/Student)
 */
router.post("/", auth, createBooking);

/**
 * @route GET /api/bookings
 * @desc Get all bookings for the logged-in user
 * @access Protected
 */
router.get("/", auth, getBookingsForUser);

export default router;
