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

router.get("/available", getAvailableClassrooms);               // ?date=YYYY-MM-DD&slot=...&branch=..&year=..&section=..
router.post("/request", createBookingRequest);                 // body
router.get("/faculty/:email", getBookingsByFaculty);           // param email
router.get("/requests", getPendingRequests);                   // pending
router.put("/approve/:id", approveBooking);                    // param id
router.put("/reject/:id", rejectBooking);                      // param id
router.delete("/cancle/:id", cancelBooking);                          // param id
router.get("/all", getAllBookings);                            // admin all bookings

export default router;
