// src/controllers/facultyController.js
import Classroom from "../models/Classroom.js";
import Booking from "../models/booking.js";
import Notification from "../models/notification.js";
import Timetable from "../models/Timetable.js";

// ✅ Get timetable for logged-in faculty
export const getTimetableForFaculty = async (req, res) => {
  try {
    const timetable = await Timetable.find({ facultyEmail: req.user.email });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timetable", error: err.message });
  }
};

// ✅ Get available classrooms
export const getAvailableClassrooms = async (req, res) => {
  try {
    const rooms = await Classroom.find({ status: "available" });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classrooms", error: err.message });
  }
};

// ✅ Faculty requests a booking
export const requestBooking = async (req, res) => {
  try {
    const { roomId, date, slot } = req.body;
    const booking = await Booking.create({
      roomId,
      date,
      slot,
      requestedBy: req.user.email,
      status: "pending",
    });
    res.json({ message: "Booking request submitted", booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to request booking", error: err.message });
  }
};

// ✅ Faculty views own bookings
export const myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ requestedBy: req.user.email });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// ✅ Update faculty availability
export const updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    // (Update logic can depend on your schema)
    res.json({ message: "Availability updated", available });
  } catch (err) {
    res.status(500).json({ message: "Failed to update availability", error: err.message });
  }
};

// ✅ Send a notification to students
export const sendNotificationToSection = async (req, res) => {
  try {
    const { branch, year, section, message } = req.body;
    await Notification.create({
      branch,
      year,
      section,
      message,
      sentBy: req.user.email,
    });
    res.json({ message: "Notification sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
};
