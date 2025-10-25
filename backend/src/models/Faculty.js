import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  availability: [
    {
      day: String,
      slot: String,
      available: { type: Boolean, default: true },
    },
  ],
}, { timestamps: true });

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;
