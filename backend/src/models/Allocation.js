// backend/src/models/Allocation.js
import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema({
  section: { type: String, required: true }, // e.g. "ISE7C"
  branch: { type: String, default: "ISE" },
  year: { type: String },
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  assignedRoomNumber: { type: String },
  day: { type: String },
  slot: { type: String },
  subject: { type: String },
  faculty: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Allocation", allocationSchema);
