import mongoose from "mongoose";

const staffroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String },
  floor: { type: String },
  capacity: { type: Number },
});

const Staffroom = mongoose.model("Staffroom", staffroomSchema);

export default Staffroom;
