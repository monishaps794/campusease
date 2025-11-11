// backend/src/models/Notification.js
import mongoose from "mongoose";
import { io } from "../../server.js";

const NotificationSchema = new mongoose.Schema(
  {
    // keep flexible to avoid breaking existing values
    scope: { type: String, required: true }, // "student" | "faculty" | "admin" (and future variants)

    // For students (section-wide)
    department: { type: String },
    year: { type: String },
    section: { type: String },

    // For faculty notifications
    facultyEmail: { type: String },

    title: { type: String, required: true },
    message: { type: String, required: true },

    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    // track recipients who already saw it
    seenBy: [{ type: String }],
  },
  { timestamps: true }
);

// 🔔 Push real-time event after each save
NotificationSchema.post("save", function (doc) {
  try {
    // Broadcast to all clients; clients filter on their side (safe + simple)
    io.emit("notification", {
      _id: doc._id,
      scope: doc.scope,
      department: doc.department,
      year: doc.year,
      section: doc.section,
      facultyEmail: doc.facultyEmail,
      title: doc.title,
      message: doc.message,
      bookingId: doc.bookingId,
      createdAt: doc.createdAt,
    });
  } catch (e) {
    console.warn("socket emit warn:", e?.message || e);
  }
});

export default mongoose.model("Notification", NotificationSchema);
