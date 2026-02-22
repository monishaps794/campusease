import mongoose from "mongoose";

const allocatorMetaSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const AllocatorMeta = mongoose.model("AllocatorMeta", allocatorMetaSchema);
export default AllocatorMeta;
