// src/models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  date: { type: String, required: true }, // keep as YYYY-MM-DD string for ease
  slot: { type: String, required: true }, // e.g. "09:00-10:00"
  requestedBy: { type: String, required: true }, // faculty email
  branch: { type: String, default: "" }, // optional
  year: { type: Number, default: null },
  section: { type: String, default: "" },
  reason: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
  },
  // if admin-approved: who approved and when
  approvedBy: { type: String, default: "" },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

BookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// index to quickly query bookings for a date & slot
BookingSchema.index({ date: 1, slot: 1, roomId: 1 });

export default mongoose.model("Booking", BookingSchema);
