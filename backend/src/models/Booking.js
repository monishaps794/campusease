import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  branch: String,
  year: String,
  section: String,
  timeSlot: String,
  reason: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Cancelled"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
