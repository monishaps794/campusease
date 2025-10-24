// src/routes/roomRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import Room from "../models/Room.js";
import { protect } from "../middleware/authmiddleware.js";


// ✅ Controller functions (fallback-safe inline handlers)
export const listRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find();
  res.status(200).json(rooms);
});

export const getRoomAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  // For now, returning a static example — you can extend this to query bookings.
  res.status(200).json({
    roomId: id,
    name: room.name,
    availableSlots: ["09:00–10:00", "13:00–14:00"],
  });
});

const router = express.Router();

/**
 * @route GET /api/rooms
 * @desc Fetch all rooms
 * @access Private (Faculty/Admin)
 */
router.get("/", protect, listRooms);

/**
 * @route GET /api/rooms/:id/availability
 * @desc Get room availability by room ID
 * @access Private
 */
router.get("/:id/availability", protect, getRoomAvailability);

/**
 * @route POST /api/rooms
 * @desc Create a new room
 * @access Private (Admin)
 */
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { name, type, capacity, location } = req.body;

    if (!name || !type || !capacity) {
      return res
        .status(400)
        .json({ message: "Name, type, and capacity are required." });
    }

    const newRoom = await Room.create({
      name,
      type,
      capacity,
      location: location || "Not specified",
    });

    res.status(201).json({
      message: "Room created successfully.",
      data: newRoom,
    });
  })
);

export default router;
