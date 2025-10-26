// backend/src/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = 465,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  OTP_EXP_MIN = 10,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // true for port 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// ✅ Verify SMTP connection once at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer connection failed:", error.message);
  } else {
    console.log("✅ Mailer connected and ready");
  }
});

// ✅ Send OTP email
export const sendOTP = async (toEmail, otp) => {
  try {
    const html = `
      <div style="font-family:sans-serif;padding:10px">
        <h2>CampusEase OTP Verification</h2>
        <p>Your OTP is <b>${otp}</b></p>
        <p>This code expires in ${OTP_EXP_MIN} minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL || `"CampusEase" <${SMTP_USER}>`,
      to: toEmail,
      subject: "Your OTP for CampusEase",
      html,
    });

    console.log(`📧 OTP email sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send OTP: ${err.message}`);
  }
};

// ✅ Send generic notification email
export const sendNotificationEmail = async (toEmail, subject, message) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL || `"CampusEase" <${SMTP_USER}>`,
      to: toEmail,
      subject,
      html: `<p>${message}</p>`,
    });
    console.log(`📢 Notification email sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send notification: ${err.message}`);
  }
};
