import mongoose from "mongoose";

const staffroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    facultyIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
  },
  { timestamps: true }
);

const Staffroom = mongoose.model("Staffroom", staffroomSchema);
export default Staffroom;
