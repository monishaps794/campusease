// backend/src/models/AllocationResult.js
import mongoose from "mongoose";

const allocationResultSchema = new mongoose.Schema({
  allocation: { type: Object, required: true }, // store all section/day/slot mappings
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AllocationResult", allocationResultSchema);
