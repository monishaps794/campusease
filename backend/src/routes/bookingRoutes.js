import express from "express";
import {
  getAvailableClassrooms,
  createBookingRequest,
  getAllBookings,
  getBookingsByFaculty,
  getPendingRequests,
  approveBooking,
  rejectBooking,
  cancelBooking,
  adminBook,
  cancelByTriplet,
  getBookingDetails,
  getSectionBookings
} from "../controllers/bookingController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ✅ 1) Check available rooms
 */
router.get("/available", getAvailableClassrooms);

/**
 * ✅ 2) Faculty workflow (Requests → Approval)
 */
router.post("/request", verifyToken, createBookingRequest);
router.get("/requests", verifyAdmin, getPendingRequests);
router.put("/approve/:id", verifyAdmin, approveBooking);
router.put("/reject/:id", verifyAdmin, rejectBooking);

/**
 * ✅ 3) Admin direct booking (Also supports override when payload.override === true)
 */
router.post("/admin-book", verifyAdmin, adminBook);

/**
 * ✅ 4) Cancel bookings
 */
router.delete("/cancel/:id", verifyToken, cancelBooking);         // by booking _id
router.delete("/cancel-by", verifyAdmin, cancelByTriplet);        // by roomNumber + date + slot

/**
 * ✅ 5) Lists / Details
 */
router.get("/all", verifyAdmin, getAllBookings);
router.get("/faculty/:email", verifyToken, getBookingsByFaculty);
router.get("/details", getBookingDetails);

/**
 * ✅ 6) Student view section bookings (Only approved bookings)
 * Used in StudentBookingsScreen
 */
router.get("/section", verifyToken, getSectionBookings);

export default router;
