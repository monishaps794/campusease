import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createOtp, verifyOtp as verifyOtpService } from "../services/otpService.js";

// ✅ Request OTP
export const requestOtp = asyncHandler(async (req, res) => {
  const { email, name, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // create user if not exists
  let user = await User.findOne({ email });
  if (!user && name) {
    user = await User.create({ name, email, role: role || "student" });
  }

  await createOtp(email);
  res.json({ message: "OTP sent (check console in dev)." });
});

// ✅ Verify OTP
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const ok = await verifyOtpService(email, otp);
  if (!ok) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: email.split("@")[0],
      email,
      role: "student",
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user });
});
