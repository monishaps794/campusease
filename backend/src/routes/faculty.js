import express from "express";
import {
  getTimetableForFaculty,
  getAvailableClassrooms,
  requestBooking,
  myBookings,
  updateAvailability,
  sendNotificationToSection,
} from "../controllers/facultyController.js";
import auth from "../middleware/auth.js";
import { getFacultyProfile } from "../controllers/facultyController.js";

const router = express.Router();

router.get("/timetable", auth, getTimetableForFaculty);
router.get("/classrooms", auth, getAvailableClassrooms);
router.post("/request-booking", auth, requestBooking);
router.get("/my-bookings", auth, myBookings);
router.put("/availability", auth, updateAvailability);
router.post("/send-notification", auth, sendNotificationToSection);
router.get("/profile", getFacultyProfile);

export default router;
