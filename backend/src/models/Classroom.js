import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  capacity: { type: Number, default: 60 },
});

export default mongoose.model("Classroom", classroomSchema);
