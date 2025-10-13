import mongoose from "mongoose";

const facultyAvailabilitySchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // format: YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "not-available", "absent"],
      default: "present",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FacultyAvailability = mongoose.model(
  "FacultyAvailability",
  facultyAvailabilitySchema
);

export default FacultyAvailability;
