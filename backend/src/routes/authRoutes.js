import express from "express";
import { requestOtp, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

// Route to request OTP
router.post("/request-otp", requestOtp);

// Route to verify OTP
router.post("/verify-otp", verifyOtp);

export default router;
