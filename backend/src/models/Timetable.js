// backend/models/Timetable.js
import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    section: { type: String, required: true },
    day: { type: String, required: true },
    subject: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;
