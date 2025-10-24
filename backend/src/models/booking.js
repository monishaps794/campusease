// backend/src/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    branch: String,
    year: String,
    section: String,
    reason: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
