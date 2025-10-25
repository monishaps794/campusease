/*import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  classroom: { type: String, required: true },
  day: { type: String, required: true },
  timeSlot: { type: String, required: true },
});

const Timetable = mongoose.model("Timetable", timetableSchema);
export default Timetable;*/

// src/models/Timetable.js
import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  period: { type: String, required: true },
  subject: { type: String, required: true },
  faculty: { type: String },
  room: { type: String },
});

const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);
export default Timetable;
