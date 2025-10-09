import asyncHandler from "express-async-handler";
import Room from "../models/Room.js";
import TimetableEntry from "../models/TimetableEntry.js";
import Booking from "../models/Booking.js";
import FacultyAvailability from "../models/FacultyAvailability.js";

// 📋 List all rooms (optionally filter by type)
export const listRooms = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = {};
  if (type) filter.type = type;
  const rooms = await Room.find(filter).lean();
  res.status(200).json(rooms);
});

// 🔍 Get room availability and status
export const getRoomAvailability = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "date=YYYY-MM-DD required" });
  }

  // Convert date → weekday name
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = dayNames[new Date(date).getDay()];

  // If weekend (Sat/Sun) treat as holiday
  const isHoliday = dayOfWeek === "Sun" || dayOfWeek === "Sat";
  if (isHoliday) {
    return res.json({
      status: "holiday",
      message: "No classes scheduled — holiday.",
      timetable: [],
      bookings: [],
    });
  }

  // Fetch timetable for the given room & day
  const timetable = await TimetableEntry.find({ roomId, dayOfWeek })
    .populate("facultyId", "name email role")
    .populate("roomId", "name type capacity location")
    .lean();

  // Fetch bookings for that date
  const bookings = await Booking.find({ roomId, date })
    .populate("facultyId", "name email")
    .lean();

  // Determine active classes (running now)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinutes
    .toString()
    .padStart(2, "0")}`;

  let currentClass = timetable.find(
    (cls) => cls.startTime <= currentTime && currentTime <= cls.endTime
  );

  let status = "empty"; // default

  if (currentClass) {
    // Check faculty availability for the class
    const facultyStatus = await FacultyAvailability.findOne({
      facultyId: currentClass.facultyId._id,
      date,
    });

    if (facultyStatus?.status === "absent") {
      status = "free"; // Faculty absent → room free
    } else {
      status = "running"; // Class ongoing
    }
  } else if (bookings.some((b) => b.date === date)) {
    status = "booked"; // Used for extra class or event
  }

  res.status(200).json({
    status,
    message:
      status === "running"
        ? "Room currently has an ongoing class."
        : status === "free"
        ? "Faculty is absent — room free for booking."
        : status === "booked"
        ? "Room booked for extra class or event."
        : "Room currently empty.",
    timetable,
    bookings,
  });
});
