/*// backend/src/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

// Create a reusable transporter
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port: Number(SMTP_PORT) || 465,
    secure: true, // use SSL for port 465
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Verify connection
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Mailer connection failed:", err.message || err);
    } else {
      console.log("✅ Mailer ready and connected");
    }
  });
} catch (err) {
  console.error("❌ Error creating mailer transporter:", err.message);
}

// ─── OTP MAIL ────────────────────────────────────────────────
export const sendOTP = async (email, otp) => {
  const text = `Your OTP code is: ${otp}\nThis code expires in 5 minutes.`;
  if (!transporter) {
    console.log(`(mailer disabled) OTP to ${email}: ${otp}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: email,
      subject: "Your OTP - CampusEase",
      text,
    });
    console.log(`📧 OTP email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message || err);
  }
};

// ─── NOTIFICATION MAIL ──────────────────────────────────────
export const sendNotificationEmail = async (email, subject, message) => {
  if (!transporter) {
    console.log(`(mailer disabled) Notification to ${email}: ${subject} - ${message}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: email,
      subject: subject || "CampusEase Notification",
      text: message || "",
    });
    console.log(`📩 Notification sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending notification:", err.message || err);
  }
};*/
// backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: {
        rejectUnauthorized: false}, // 👈 ignore self-signed cert
      
    });

    transporter.verify((err) => {
      if (err) {
        console.error("❌ Mailer connection failed:", err.message);
        transporter = null; // fallback to console
      } else {
        console.log("✅ Mailer ready");
      }
    });
  } catch (err) {
    console.error("❌ Mailer setup error:", err.message);
    transporter = null;
  }
} else {
  console.warn("⚠️ SMTP_USER / SMTP_PASS not set — using console fallback");
}

// ─── Send OTP ────────────────────────────────────────────────
export const sendOTP = async (email, otp) => {
  const text = `Your OTP code is: ${otp}\nThis code expires in 5 minutes.`;

  // console fallback
  if (!transporter) {
    console.log(`(mailer disabled) OTP to ${email}: ${otp}`);
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
    console.error("❌ Error sending OTP:", err.message);
    console.log(`(mailer fallback) OTP to ${email}: ${otp}`);
  }
};

// ─── Send Notification ──────────────────────────────────────
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
    console.error("❌ Error sending notification:", err.message);
  }
};

