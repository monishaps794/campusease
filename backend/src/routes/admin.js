import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllUsers,
  createFaculty,
  deleteUser,
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", auth, getAllUsers);
router.post("/faculty", auth, createFaculty);
router.delete("/user/:id", auth, deleteUser);
router.get("/bookings", auth, getAllBookings);
router.put("/bookings/:id/approve", auth, approveBooking);
router.put("/bookings/:id/reject", auth, rejectBooking);

export default router;
