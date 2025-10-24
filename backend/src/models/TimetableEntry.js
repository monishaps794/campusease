import mongoose from "mongoose";

const timetableEntrySchema = new mongoose.Schema(
  {
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true, trim: true },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    periodIndex: { type: Number, required: true },
    subject: { type: String, required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

const TimetableEntry = mongoose.model("TimetableEntry", timetableEntrySchema);
export default TimetableEntry;
