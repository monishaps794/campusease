// src/models/Classroom.js
import mongoose from "mongoose";

const ClassroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  blockName: { type: String, default: "" },
  capacity: { type: Number, default: 0 },
  // blocked: admin can block a room for maintenance
  blocked: { type: Boolean, default: false },
  // status: Available | Booked (booked only when admin explicitly sets booking)
  status: {
    type: String,
    enum: ["Available", "Booked"],
    default: "Available",
  },
  meta: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model("Classroom", ClassroomSchema);
