import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  blockName: { type: String, required: true },
  capacity: Number,
  status: { type: String, enum: ["Available", "Booked"], default: "Available" },
});

export default mongoose.model("Classroom", classroomSchema);
