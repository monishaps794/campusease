import mongoose from "mongoose";

const AllocatorLogSchema = new mongoose.Schema({
  mode: { 
    type: String, 
    enum: ["rotate7c", "manual7c", "reset-pointer", "save"], 
    required: true 
  },
  pointerIndex: { type: Number, default: 0 },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AllocatorLog", AllocatorLogSchema);
