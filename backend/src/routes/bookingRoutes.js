// backend/src/routes/bookingRoutes.js
import express from "express";
import {
  getAvailableClassrooms,
  createBookingRequest,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getPendingRequests,
  getAllBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

// availability
router.get("/available", getAvailableClassrooms);

// create request
router.post("/request", createBookingRequest);

// faculty routes
router.get("/faculty/:email", getMyBookings);
router.delete("/:id", cancelBooking);

// admin routes
router.put("/approve/:id", approveBooking);
router.put("/reject/:id", rejectBooking);
router.get("/requests", getPendingRequests);
router.get("/all", getAllBookings);

export default router;
