import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  branch: String,
  year: String,
  section: String,
  day: String,
  slots: [
    {
      timeSlot: String,  // e.g., "9:00-10:00"
      classroom: String, // classroom number
      faculty: String,
      subject: String,
    },
  ],
});

export default mongoose.model("Timetable", timetableSchema);
