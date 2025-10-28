import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "faculty", "student"], required: true },
    department: String,
    year: String,
    section: String,
    semester: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
