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
