// backend/src/models/OTP.js
import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * (process.env.OTP_EXP_MIN || 5), // Auto-delete after X minutes
  },
});

export default mongoose.model("OTP", OTPSchema);
/*import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String, // ✅ changed from 'code' → 'otp' to match controller
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    index: { expires: "5m" }, // ✅ auto-delete after 5 minutes
  },
});

export default mongoose.model("Otp", OtpSchema);*/
