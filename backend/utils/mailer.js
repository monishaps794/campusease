import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  OTP_EXP_MIN = 10,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // true for SSL
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  tls: { rejectUnauthorized: false },
});

// ✅ Verify SMTP connection
transporter.verify((err, success) => {
  if (err) console.error("❌ Mailer verification failed:", err.message);
  else console.log("✅ Mailer ready");
});

// ✅ Send OTP email
export const sendOTP = async (toEmail, otp) => {
  try {
    const html = `
      <p>Your <b>CampusEase</b> OTP is <b>${otp}</b>.</p>
      <p>It expires in ${OTP_EXP_MIN} minutes.</p>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: toEmail,
      subject: "CampusEase OTP Verification",
      html,
    });

    console.log(`📧 OTP sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send OTP to ${toEmail}:`, err.message);
  }
};

// ✅ Send general notification
export const sendNotificationEmail = async (toEmail, subject, message) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to: toEmail,
      subject,
      html: `<p>${message}</p>`,
    });
    console.log(`📢 Notification email sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${toEmail}:`, err.message);
  }
};
