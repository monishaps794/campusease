import express from "express";
import asyncHandler from "express-async-handler";
import Room from "../models/Room.js";
import { listRooms, getRoomAvailability } from "../controllers/roomController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📋 Get all rooms
router.get("/", auth, listRooms);

// 🔍 Get room availability
router.get("/:id/availability", auth, getRoomAvailability);

// ➕ Create new room
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const { name, type, capacity, location } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Room.create({ name, type, capacity, location });
    res.status(201).json(room);
  })
);

export default router;
