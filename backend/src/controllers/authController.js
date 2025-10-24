// ✅ src/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 📨 REQUEST OTP
 */
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role: "faculty", name: "Faculty User" });
      await user.save();
    }

    // Generate a mock OTP
    const otp = "123456"; // ✅ static for testing
    user.otp = otp;
    await user.save();

    console.log(`✅ OTP for ${email}: ${otp}`);
    res.json({ message: "OTP sent successfully (mock)", otp }); // mock only for testing
  } catch (err) {
    console.error("❌ Error in requestOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ VERIFY OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP
    user.otp = null;
    await user.save();

    // Create JWT
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env");
      return res.status(500).json({ message: "Server misconfigured: missing JWT_SECRET" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error in verifyOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};
