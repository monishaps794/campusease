// backend/src/controllers/authController.js
import OTP from "../models/OTP.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendOTP } from "../../utils/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const OTP_EXP_MIN = parseInt(process.env.OTP_EXP_MIN || "5", 10);

// ✅ 1️⃣ Request OTP (Login step)
export const requestOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    email = email.toLowerCase().trim();

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email },
      { email, code: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`✅ OTP for ${email}: ${otpCode}`);

    await sendOTP(email, otpCode);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

// ✅ 2️⃣ Verify OTP (Token generation only here)
export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    email = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found" });

    const diffMinutes =
      (Date.now() - otpRecord.createdAt.getTime()) / 1000 / 60;
    if (diffMinutes > OTP_EXP_MIN) {
      await OTP.deleteOne({ email });
      return res
        .status(400)
        .json({ message: "OTP expired, request a new one." });
    }

    if (otpRecord.code !== otp.toString())
      return res.status(400).json({ message: "Invalid OTP" });

    // ✅ OTP verified — delete record
    await OTP.deleteOne({ email });

    // Find existing user or create student by default
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: email.split("@")[0],
        role: "student",
      });
    }

    // ✅ Issue JWT only after valid OTP
    const token = jwt.sign(
      { email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user,
    });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({ message: "Server error while verifying OTP." });
  }
};

// ✅ 3️⃣ Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists." });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin",
    });

    res
      .status(201)
      .json({ success: true, message: "Admin registered.", user });
  } catch (err) {
    console.error("❌ Register Admin Error:", err);
    res.status(500).json({ message: "Server error registering admin." });
  }
};

// ✅ 4️⃣ Register Faculty (no availability field)
export const registerFaculty = async (req, res) => {
  try {
    const { name, email, department, designation } = req.body;
    if (!name || !email || !department || !designation)
      return res.status(400).json({ message: "All fields are required." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Faculty already exists." });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      department,
      designation,
      role: "faculty",
    });

    res
      .status(201)
      .json({ success: true, message: "Faculty registered.", user });
  } catch (err) {
    console.error("❌ Register Faculty Error:", err);
    res.status(500).json({ message: "Server error registering faculty." });
  }
};

// ✅ 5️⃣ Register Student
export const registerStudent = async (req, res) => {
  try {
    const { name, email, department, year, section, semester } = req.body;
    if (!name || !email || !department || !year || !section || !semester)
      return res.status(400).json({ message: "All fields are required." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Student already exists." });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      department,
      year,
      section,
      semester,
      role: "student",
    });

    res
      .status(201)
      .json({ success: true, message: "Student registered.", user });
  } catch (err) {
    console.error("❌ Register Student Error:", err);
    res.status(500).json({ message: "Server error registering student." });
  }
};
