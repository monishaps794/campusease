import mongoose from "mongoose";

// 🏫 Define the Room schema
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
      enum: ["classroom", "lab"],
      default: "classroom",
    },
    capacity: {
      type: Number,
      default: 50,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// 🏗️ Create model
const Room = mongoose.model("Room", roomSchema);
export default Room;
