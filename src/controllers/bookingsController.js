import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import TimetableEntry from "../models/TimetableEntry.js";
import Room from "../models/Room.js";
import Notification from "../models/Notification.js";

// 📘 Create a new booking
export const createBooking = asyncHandler(async (req, res) => {
  const user = req.user;
  const { roomId, startTime, endTime, reason } = req.body;

  if (!roomId || !startTime || !endTime) {
    return res
      .status(400)
      .json({ message: "roomId, startTime, and endTime are required" });
  }

  const s = new Date(startTime);
  const e = new Date(endTime);

  // Check for conflicting bookings
  const conflict = await Booking.findOne({
    roomId,
    status: { $in: ["approved", "pending"] },
    $or: [
      { startTime: { $lt: e, $gte: s } },
      { endTime: { $gt: s, $lte: e } },
      { startTime: { $lte: s }, endTime: { $gte: e } },
    ],
  }).lean();

  if (conflict) {
    return res.status(409).json({ message: "Booking conflict" });
  }

  // Create booking
  const booking = await Booking.create({
    userId: user._id,
    roomId,
    startTime: s,
    endTime: e,
    reason,
    status: "approved",
  });

  // Create notification and emit via socket.io
  const notif = await Notification.create({
    to: [],
    title: "Room booked",
    body: `${user.name} booked room`,
    meta: { bookingId: booking._id },
  });

  const io = req.app.get("io");
  if (io) io.emit("notification", notif);

  res.json({ booking });
});

// 📗 Get all bookings for logged-in user
export const getBookingsForUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const bookings = await Booking.find({ userId: user._id })
    .populate("roomId")
    .lean();

  res.json(bookings);
});
