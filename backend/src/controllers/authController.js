/*import OTP from "../models/OTP.js";
import User from "../models/User.js";
import { sendOTP } from "../../utils/mailer.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// 📩 Request OTP
const requestOtp = async (req, res) => {
  // your existing logic here
};

// ✅ Verify OTP
const verifyOtp = async (req, res) => {
  // your existing logic here
};

// 👩‍🏫 Register Faculty
const registerFaculty = async (req, res) => {
  // your existing logic here
};

// 🧑‍💼 Register Admin
const registerAdmin = async (req, res) => {
  // your existing logic here
};

// ✅ Export all functions
export { requestOtp, verifyOtp, registerFaculty, registerAdmin };*/

import OTP from "../models/OTP.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// 📩 Request OTP
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000);

    // Save or update OTP in DB
    await OTP.findOneAndUpdate(
      { email },
      { email, code: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`✅ OTP for ${email}: ${otpCode}`); // for debugging

    // If you want to send via email, integrate sendOTP(email, otpCode) here.

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otp: otpCode, // show OTP in response for testing (remove in production)
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    if (otpRecord.code.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP valid — create JWT token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    // Optionally delete OTP after verification
    await OTP.deleteOne({ email });

    res.status(200).json({ success: true, message: "OTP verified", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 👩‍🏫 Register Faculty
export const registerFaculty = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      name,
      email,
      password,
      role: "faculty",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Faculty registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering faculty:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧑‍💼 Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      name,
      email,
      password,
      role: "admin",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};
