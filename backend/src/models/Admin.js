import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllBookings,
  approveBooking,
  rejectBooking,
  getAllFaculty,
} from "../controllers/adminController.js";
import { getPendingRequests, approveBooking } from "../controllers/adminController.js";
const router = express.Router();

router.get("/bookings", auth, getAllBookings);
router.put("/bookings/:id/approve", auth, approveBooking);
router.put("/bookings/:id/reject", auth, rejectBooking);
router.get("/faculty", auth, getAllFaculty);
router.get("/requests", getPendingRequests);

// Approve/reject booking
router.post("/approve", approveBooking);
export default router;
