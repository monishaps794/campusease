// src/services/otpService.js
import crypto from "crypto";

const otpStore = new Map(); // { email -> { otp, expiresAt } }

// ✅ Function to create an OTP and save it temporarily
export const createOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  otpStore.set(email, { otp, expiresAt });

  console.log(`📧 OTP for ${email}: ${otp}`); // In production, send via email
  return otp;
};

// ✅ Function to verify OTP
export const verifyOtp = async (email, otp) => {
  const record = otpStore.get(email);
  if (!record) return false;

  const { otp: storedOtp, expiresAt } = record;
  if (Date.now() > expiresAt) {
    otpStore.delete(email);
    return false;
  }

  const isValid = storedOtp === otp;
  if (isValid) otpStore.delete(email);
  return isValid;
};
