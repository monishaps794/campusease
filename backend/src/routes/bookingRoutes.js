import express from "express";
import {
  getAvailableClassrooms,
  createBookingRequest,
  getBookingsByFaculty,
  getPendingRequests,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getAllBookings,
  getAvailableRoomsByDate,
  createAdminBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/available", getAvailableClassrooms);
router.post("/request", createBookingRequest);
router.get("/faculty/:email", getBookingsByFaculty);
router.get("/requests", getPendingRequests);
router.put("/approve/:id", approveBooking);
router.put("/reject/:id", rejectBooking);
router.delete("/cancel/:id", cancelBooking);
router.get("/all", getAllBookings);

// ✅ new routes
router.get("/available-by-date", getAvailableRoomsByDate);
router.post("/admin/book", createAdminBooking);

export default router;
