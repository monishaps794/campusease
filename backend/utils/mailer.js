// backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.error("❌ Missing SMTP credentials in .env");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.gmail.com",
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify mailer connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mailer connection failed:", err.message);
  } else {
    console.log("✅ Mailer ready to send messages");
  }
});

/**
 * ✅ Send OTP Email
 */
export const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"CampusEase" <${FROM_EMAIL || SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code - CampusEase",
      text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
  }
};

/**
 * 📩 Send Booking Notification Email
 */
export const sendNotificationEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: `"CampusEase" <${FROM_EMAIL || SMTP_USER}>`,
      to: email,
      subject: subject || "CampusEase Notification",
      text: message || "You have a new notification from CampusEase.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📩 Notification email sent to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("❌ Error sending notification email:", error.message);
  }
};
