import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/**
 * 📨 REQUEST OTP
 */
router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role: "faculty", name: "Faculty User" });
      await user.save();
    }

    const otp = "123456";
    user.otp = otp;
    await user.save();

    console.log(`✅ OTP for ${email}: ${otp}`);
    res.json({ message: "OTP sent successfully (mock)", otp });
  } catch (err) {
    console.error("Error in /request-otp:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ VERIFY OTP
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    user.otp = null;
    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured: missing JWT_SECRET" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Error in /verify-otp:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ FIX — Export router as default
export default router;
