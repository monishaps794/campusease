import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    to: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional array of recipients
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: "info" }, // e.g., info, alert, etc.
    meta: { type: Object, default: {} },     // extra data
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
