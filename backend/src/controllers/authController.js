import Otp from "../models/OTP.js";
import { sendOTP } from "../../utils/mailer.js";

/**
 * 🟢 Request OTP
 */
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email required" });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update OTP record
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Try sending the OTP email
    try {
      await sendOTP(email, code);
    } catch (err) {
      console.warn("⚠️ Mailer failed:", err.message);
    }

    console.log(`✅ OTP requested for ${email} — Code: ${code}`);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ requestOtp error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while sending OTP" });
  }
};

/**
 * 🟢 Verify OTP + Assign Role
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP required" });

    // Find OTP record
    const record = await Otp.findOne({ email: email.toLowerCase() });
    if (!record)
      return res
        .status(400)
        .json({ success: false, message: "OTP not found. Please request again." });

    // Check OTP match
    if (record.code !== otp.toString())
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Check expiry (default 5 minutes)
    const age = (Date.now() - record.createdAt.getTime()) / 60000;
    const expiryLimit = parseInt(process.env.OTP_EXP_MIN || 5, 10);
    if (age > expiryLimit)
      return res.status(400).json({ success: false, message: "OTP expired" });

    // ✅ Define role mapping manually
    const roleOverrides = {
      "sahanaa2060@gmail.com": "admin",
      "sahana1050@gmail.com": "faculty",
      "sahana.mn1ga23is137@gmail.com": "student",
      "monisha@gmail.com": "admin",
      "faculty1050@gmail.com": "faculty",
    };

    // Default role
    const role = roleOverrides[email.toLowerCase()] || "student";

    console.log(`✅ OTP verified for ${email} → Role: ${role}`);

    // Delete OTP after successful verification
    await Otp.deleteOne({ email: email.toLowerCase() });

    // ✅ Send response structure frontend expects
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: {
        email,
        role,
      },
    });
  } catch (err) {
    console.error("❌ verifyOtp error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during OTP verification" });
  }
};
