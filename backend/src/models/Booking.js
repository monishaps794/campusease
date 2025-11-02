// backend/src/models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }, // optional now
  roomNumber: { type: String }, // new field, supports booking using number
  date: { type: String, required: true }, // YYYY-MM-DD
  slot: { type: String, required: true },
  branch: String,
  year: String,
  section: String,
  reason: String,
  requestedBy: { type: String, required: true }, // email or "admin"
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
    required: true,
  },
  approvedBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

// Ensure status lowerCase & update updatedAt
BookingSchema.pre("save", function (next) {
  if (this.status && typeof this.status === "string") {
    this.status = this.status.toLowerCase();
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Booking", BookingSchema);
