import mongoose from "mongoose";

const timetableEntrySchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // CSE, ECE, MECH, etc.
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // restrict to weekdays
    },
    periodIndex: {
      type: Number,
      required: true,
      min: 1,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:mm format"],
    },
    isActive: {
      type: Boolean,
      default: true, // helpful if a timetable is replaced later
    },
  },
  { timestamps: true }
);

// Prevent duplicate timetable entries for the same slot
timetableEntrySchema.index(
  { branch: 1, semester: 1, section: 1, dayOfWeek: 1, periodIndex: 1 },
  { unique: true }
);

const TimetableEntry = mongoose.model("TimetableEntry", timetableEntrySchema);
export default TimetableEntry;
