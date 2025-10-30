// backend/src/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false }, // dev-friendly
  });

  transporter.verify((err) => {
    if (err) {
      console.error("❌ Mailer connection failed:", err.message || err);
      transporter = null; // disable transporter on error so sending falls back to console
    } else {
      console.log("✅ Mailer ready");
    }
  });
} else {
  console.warn("⚠️ SMTP_USER / SMTP_PASS not set — mailer disabled (using console fallback)");
}

export const sendOTP = async (email, otp) => {
  const text = `Your OTP code is: ${otp}\nThis code expires in 5 minutes.`;
  if (!transporter) {
    console.log(`(mailer disabled) OTP to ${email}: ${otp}\n${text}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"CampusEase" <${FROM_EMAIL || SMTP_USER}>`,
      to: email,
      subject: "Your OTP - CampusEase",
      text,
    });
    console.log(`📧 OTP email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message || err);
    // don't throw -- fall back to console
    console.log(`(mailer fallback) OTP to ${email}: ${otp}`);
  }
};

export const sendNotificationEmail = async (email, subject, message) => {
  if (!transporter) {
    console.log(`(mailer disabled) Notification to ${email}: ${subject} - ${message}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"CampusEase" <${FROM_EMAIL || SMTP_USER}>`,
      to: email,
      subject: subject || "CampusEase Notification",
      text: message || "",
    });
    console.log(`📩 Notification sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending notification:", err.message || err);
  }
};
