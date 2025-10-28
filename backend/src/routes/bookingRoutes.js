// backend/src/routes/bookingRoutes.js
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
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/available", getAvailableClassrooms);    // ?slot=...&date=...&day=...&branch=...
router.post("/request", createBookingRequest);
router.get("/faculty/:email", getBookingsByFaculty);
router.get("/requests", getPendingRequests);
router.put("/approve/:id", approveBooking);
router.put("/reject/:id", rejectBooking);
router.delete("/:id", cancelBooking);
router.get("/all", getAllBookings);

export default router;
