import mongoose from "mongoose";

// 🏫 Room Schema
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["classroom", "lab", "seminar hall"],
      required: [true, "Room type is required"],
      lowercase: true,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 50,
      min: [1, "Capacity must be at least 1"],
    },
    location: {
      type: String,
      trim: true,
      default: "Not specified",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// 🏗️ Create Model
const Room = mongoose.model("Room", roomSchema);
export default Room;
