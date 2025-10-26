// backend/src/controllers/bookingController.js
import Booking from "../models/Booking.js";
import Classroom from "../models/Classroom.js";
import Timetable from "../models/Timetable.js";
import { sendNotificationEmail } from "../../utils/mailer.js"; // mailer is in backend/utils

// GET /bookings/available?branch=&year=&section=&timeSlot=&day=
export const getAvailableClassrooms = async (req, res) => {
  try {
    const { branch, year, section, timeSlot, day } = req.query;

    // Find classrooms used by this section at that day/time (timetable)
    let occupiedRooms = [];
    if (branch && year && section && day && timeSlot) {
      const tts = await Timetable.find({
        branch,
        year,
        section,
        day,
        "slots.timeSlot": timeSlot,
      }).lean();

      occupiedRooms = tts.flatMap((t) =>
        (t.slots || []).filter((s) => s.timeSlot === timeSlot).map((s) => s.classroom)
      );
    }

    // Exclude classrooms that have approved bookings (global blocking)
    const approvedBookings = await Booking.find({ status: "approved" }).lean();
    const bookedRoomIds = approvedBookings
      .map((b) => String(b.roomId || b.classroomId))
      .filter(Boolean);

    const exclude = Array.from(new Set([...occupiedRooms, ...bookedRoomIds]));

    const available = await Classroom.find({
      _id: { $nin: exclude },
      blocked: { $ne: true },
    }).lean();

    return res.json(available);
  } catch (err) {
    console.error("getAvailableClassrooms:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /bookings/request
// body: { roomId, date, slot, branch, year, section, reason, requestedBy }
export const createBookingRequest = async (req, res) => {
  try {
    const { roomId, date, slot, branch, year, section, reason, requestedBy } = req.body;
    if (!roomId || !date || !slot || !requestedBy) {
      return res.status(400).json({ message: "roomId, date, slot and requestedBy required" });
    }

    const booking = await Booking.create({
      roomId,
      date,
      slot,
      branch,
      year,
      section,
      reason,
      requestedBy,
      status: "pending",
      createdAt: new Date(),
    });

    // Optional email to admin
    try {
      await sendNotificationEmail(
        process.env.ADMIN_EMAIL || "admin@campusease.com",
        "New Booking Request",
        `Booking requested by ${requestedBy} for ${date} (${slot}) in room ${roomId}`
      );
    } catch (e) {
      console.warn("Failed to send admin email:", e.message);
    }

    return res.status(201).json({ message: "Booking request created", booking });
  } catch (err) {
    console.error("createBookingRequest:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /bookings/faculty/:email
export const getMyBookings = async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await Booking.find({ requestedBy: email }).sort({ createdAt: -1 }).lean();
    return res.json(bookings);
  } catch (err) {
    console.error("getMyBookings:", err);
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /bookings/:id  -> cancel by faculty or admin
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    // If previously approved, free classroom if no other approved exists
    if (booking.roomId) {
      const otherApproved = await Booking.findOne({
        _id: { $ne: booking._id },
        roomId: booking.roomId,
        status: "approved",
      });
      if (!otherApproved) {
        await Classroom.findByIdAndUpdate(booking.roomId, { status: "Available" });
      }
    }

    return res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBooking:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /bookings/approve/:id  -> admin approve
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("roomId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "approved";
    await booking.save();

    if (booking.roomId) {
      await Classroom.findByIdAndUpdate(booking.roomId._id || booking.roomId, { status: "Booked" });
    }

    try {
      await sendNotificationEmail(
        booking.requestedBy,
        "Booking Approved",
        `Your booking for ${booking.roomId?.roomNumber || booking.roomId} on ${booking.date} (${booking.slot}) is approved.`
      );
    } catch (e) {
      console.warn("Notification email failed:", e.message);
    }

    return res.json({ message: "Booking approved", booking });
  } catch (err) {
    console.error("approveBooking:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /bookings/reject/:id  -> admin reject
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("roomId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "rejected";
    await booking.save();

    try {
      await sendNotificationEmail(
        booking.requestedBy,
        "Booking Rejected",
        `Your booking for ${booking.roomId?.roomNumber || booking.roomId} on ${booking.date} (${booking.slot}) is rejected.`
      );
    } catch (e) {
      console.warn("Notification email failed:", e.message);
    }

    return res.json({ message: "Booking rejected", booking });
  } catch (err) {
    console.error("rejectBooking:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /bookings/requests  -> pending for admin
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Booking.find({ status: "pending" }).sort({ createdAt: -1 }).lean();
    return res.json(requests);
  } catch (err) {
    console.error("getPendingRequests:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /bookings/all  -> admin all bookings
export const getAllBookings = async (req, res) => {
  try {
    const all = await Booking.find().sort({ createdAt: -1 }).lean();
    return res.json(all);
  } catch (err) {
    console.error("getAllBookings:", err);
    return res.status(500).json({ message: err.message });
  }
};
