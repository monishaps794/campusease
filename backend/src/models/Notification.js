import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipientType: { type: String, enum: ["faculty", "student", "admin", "all"], default: "all" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite errors during hot-reload
const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
