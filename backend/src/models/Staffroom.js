// backend/models/Staffroom.js
import mongoose from "mongoose";

const StaffroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  room: { type: String, required: true },
  block: { type: String, required: true },
});

export default mongoose.model("Staffroom", StaffroomSchema);
