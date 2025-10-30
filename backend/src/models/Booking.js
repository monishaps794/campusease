// backend/src/models/Booking.js
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  slot: { type: String, required: true },
  branch: String,
  year: String,
  section: String,
  reason: String,
  requestedBy: { type: String, required: true }, // email
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

// Ensure status always stored in lowercase
BookingSchema.pre("save", function (next) {
  if (this.status && typeof this.status === "string") this.status = this.status.toLowerCase();
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Booking", BookingSchema);
