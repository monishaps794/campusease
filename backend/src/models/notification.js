// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true },
    sender: { type: String }, // faculty/admin email or name
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
