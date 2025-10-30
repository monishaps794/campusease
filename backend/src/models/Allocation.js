// backend/src/models/Allocation.js
import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema({
  section: { type: String, required: true }, // e.g. "3A"
  branch: { type: String, default: "ISE" },
  year: { type: String },
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  assignedRoomNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Allocation", allocationSchema);
