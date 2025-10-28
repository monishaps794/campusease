// backend/src/routes/auth.js
import express from "express";
import {
  requestOtp,
  verifyOtp,
  registerAdmin,
  registerFaculty,
  registerStudent,
} from "../controllers/authController.js";

const router = express.Router();

// OTP routes
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);

// Registration routes
router.post("/register-admin", registerAdmin);
router.post("/register-faculty", registerFaculty);
router.post("/register-student", registerStudent);

export default router;
