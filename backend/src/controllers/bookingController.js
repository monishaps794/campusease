// backend/src/controllers/bookingController.js
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Classroom from "../models/Classroom.js";
import Timetable from "../models/Timetable.js";
import { sendNotificationEmail } from "../../utils/mailer.js";

/** Normalize a room identifier (e.g., "ISE101") */
const normalizeRoomNumber = (raw) => {
  if (!raw) return null;
  return String(raw).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
};

/**
 * POST /bookings/request
 * Faculty creates booking request.
 * Body: { roomNumber, date, slot, branch, year, section, facultyEmail, facultyName }
 */
export const createBookingRequest = async (req, res) => {
  try {
    let {
      roomId,
      roomNumber,
      date,
      slot,
      branch,
      year,
      section,
      reason,
      facultyEmail,
      facultyName,
    } = req.body;

    if (!date || !slot || !(roomId || roomNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "roomNumber, date and slot required" });
    }

    // Derive a normalized requestedBy (faculty)
    const requestedBy =
      (facultyEmail || "").toLowerCase() ||
      (facultyName || "unknown@college.edu").toLowerCase();

    // Resolve roomId if only roomNumber is provided
    if (!roomId && roomNumber) {
      const normalized = normalizeRoomNumber(roomNumber);
      const found = await Classroom.findOne({
        $or: [
          { roomNumber: roomNumber },
          { roomNumber: roomNumber.replace(/[-\s]/g, "") },
          { roomNumber: normalized },
          { name: roomNumber },
        ],
      });
      if (found) roomId = found._id;
    }

    // Validate
    if (!roomId || !mongoose.isValidObjectId(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing classroom" });
    }

    // Prevent double-booking
    const already = await Booking.findOne({
      roomId,
      date,
      slot,
      status: { $in: ["pending", "approved"] },
    });
    if (already) {
      return res
        .status(409)
        .json({ success: false, message: "Room already booked for that slot" });
    }

    // Create new booking request
    const newBooking = await Booking.create({
      roomId,
      date,
      slot,
      branch,
      year,
      section,
      reason: reason || "Classroom Booking",
      requestedBy,
      facultyName: facultyName || "Faculty",
      status: "pending",
      createdAt: new Date(),
    });

    // Optional admin notification
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
      if (adminEmail) {
        await sendNotificationEmail(
          adminEmail,
          "New Booking Request",
          `Faculty ${facultyName} (${facultyEmail}) requested ${roomNumber} on ${date} (${slot}).`
        );
      }
    } catch (e) {
      console.warn("sendNotificationEmail failed:", e?.message || e);
    }

    return res.status(201).json({
      success: true,
      message: "Booking request submitted successfully!",
      booking: newBooking,
    });
  } catch (err) {
    console.error("createBookingRequest:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/** GET /bookings/all (admin) */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("roomId", "roomNumber name type capacity")
      .sort({ date: 1, slot: 1 })
      .lean();
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("getAllBookings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /bookings/faculty/:email */
export const getBookingsByFaculty = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Faculty email required" });

    const bookings = await Booking.find({
      requestedBy: String(email).toLowerCase(),
    })
      .populate("roomId", "roomNumber name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error("getBookingsByFaculty:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** GET /bookings/requests (admin) */
export const getPendingRequests = async (req, res) => {
  try {
    const pending = await Booking.find({ status: "pending" })
      .populate("roomId", "roomNumber name type capacity")
      .sort({ date: 1 })
      .lean();
    return res.json({ success: true, requests: pending });
  } catch (err) {
    console.error("getPendingRequests:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /bookings/approve/:id */
export const approveBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Valid booking id required" });

    const booking = await Booking.findById(id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      roomId: booking.roomId,
      date: booking.date,
      slot: booking.slot,
      status: "approved",
    });
    if (conflict)
      return res
        .status(409)
        .json({ success: false, message: "Room already approved for that slot" });

    booking.status = "approved";
    booking.approvedBy = req.user?.email || "admin";
    await booking.save();

    try {
      await sendNotificationEmail(
        booking.requestedBy,
        "Booking Approved",
        `Your booking for ${booking.date} (${booking.slot}) has been approved.`
      );
    } catch (e) {
      console.warn("notify requester failed:", e?.message || e);
    }

    return res.json({ success: true, message: "Booking approved", booking });
  } catch (err) {
    console.error("approveBooking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** PUT /bookings/reject/:id */
export const rejectBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Valid booking id required" });

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    try {
      await sendNotificationEmail(
        booking.requestedBy,
        "Booking Rejected",
        `Your booking for ${booking.date} (${booking.slot}) was rejected.`
      );
    } catch (e) {
      console.warn("notify requester failed:", e?.message || e);
    }

    return res.json({ success: true, message: "Booking rejected", booking });
  } catch (err) {
    console.error("rejectBooking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** DELETE /bookings/:id */
export const cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Valid booking id required" });

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    return res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBooking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /bookings/available
 * Query: branch, year, section, date, slot
 */
export const getAvailableClassrooms = async (req, res) => {
  try {
    const { branch, year, section, date, day, slot } = req.query;
    if (!date || !slot)
      return res
        .status(400)
        .json({ success: false, message: "date and slot required" });

    let dayName = day;
    if (!dayName && date) {
      const d = new Date(date + "T00:00:00");
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      dayName = days[d.getDay()];
    }

    const excludedRoomIds = new Set();
    const excludedRoomNumbers = new Set();

    if (branch && year && section && dayName) {
      const tts = await Timetable.find({ branch, year, section, day: dayName }).lean();
      for (const tt of tts) {
        for (const s of tt.slots || []) {
          const sTime = s.timeSlot || s.time || s.timeRange || "";
          if (String(sTime).trim() === String(slot).trim()) {
            if (s.classroom && mongoose.isValidObjectId(s.classroom)) {
              excludedRoomIds.add(String(s.classroom));
            }
            if (s.classroom && typeof s.classroom === "string") {
              excludedRoomNumbers.add(normalizeRoomNumber(s.classroom));
            }
          }
        }
      }
    }

    const approved = await Booking.find({ date, slot, status: "approved" }).lean();
    for (const b of approved) {
      if (b.roomId) excludedRoomIds.add(String(b.roomId));
    }

    const allClassrooms = await Classroom.find().lean();
    const available = allClassrooms.filter((c) => {
      const cid = String(c._id);
      const rn = normalizeRoomNumber(c.roomNumber || c.name);
      if (excludedRoomIds.has(cid)) return false;
      if (rn && excludedRoomNumbers.has(rn)) return false;
      if (c.blocked) return false;
      return true;
    });

    return res.json({
      success: true,
      available,
      excluded: {
        roomIds: Array.from(excludedRoomIds),
        roomNumbers: Array.from(excludedRoomNumbers),
      },
    });
  } catch (err) {
    console.error("getAvailableClassrooms:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
