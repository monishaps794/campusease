import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  resources: [String],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Classroom = mongoose.model("Classroom", classroomSchema);
export default Classroom;
