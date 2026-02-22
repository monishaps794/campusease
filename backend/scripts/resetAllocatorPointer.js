import mongoose from "mongoose";
import AllocatorMeta from "../src/models/AllocatorMeta.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/campusease"; // change if needed

await mongoose.connect(MONGO_URI);

const result = await AllocatorMeta.findOneAndUpdate(
  { key: "rotationIndex" },
  { value: 0 },
  { upsert: true, new: true }
);

console.log("✅ Pointer reset successful:", result);
await mongoose.disconnect();
