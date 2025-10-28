// backend/src/models/Timetable.js
import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  timeSlot: { type: String, required: true },
  subjectName: { type: String, required: true },
  facultyName: { type: String, required: true },
  classroom: String,
  type: String,
});

const timetableSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  day: { type: String, required: true },
  slots: [slotSchema],
});

export default mongoose.model("Timetable", timetableSchema);
