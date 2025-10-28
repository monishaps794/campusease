// backend/src/controllers/bookingController.js
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Classroom from "../models/Classroom.js";
// ... other imports

export const createBookingRequest = async (req, res) => {
  try {
    let { roomId, date, slot, branch, year, section, reason, requestedBy } = req.body;
    if (!date || !slot || !requestedBy) {
      return res.status(400).json({ message: "roomId (or roomNumber), date, slot and requestedBy required" });
    }

    // If roomId is a string that looks like a roomNumber (non ObjectId), try to find classroom by roomNumber
    let finalRoomId = roomId;
    if (roomId && typeof roomId === "string") {
      // if passed as roomNumber like "ISE-101" or "ISE101"
      const byNumber = await Classroom.findOne({ $or: [{ roomNumber: roomId }, { roomNumber: roomId.replace(/-/g, "") }] });
      if (byNumber) finalRoomId = byNumber._id;
      // else if it's a 24 hex chars string, mongoose cast will handle it
    }

    // Validate room id
    if (!finalRoomId) {
      return res.status(400).json({ message: "Invalid roomId or roomNumber" });
    }

    // check existing approved booking for that room/date/slot
    const already = await Booking.findOne({ roomId: finalRoomId, date, slot, status: "approved" });
    if (already) return res.status(409).json({ message: "Room already booked for that time" });

    const booking = await Booking.create({
      roomId: finalRoomId,
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

    // notify admin (best-effort)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
      if (adminEmail) {
        // import sendNotificationEmail at top of file
        await sendNotificationEmail(adminEmail, "New Booking Request", `Requested by ${requestedBy} for ${date} ${slot}`);
      }
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    return res.status(201).json({ success: true, message: "Booking request created", booking });
  } catch (err) {
    console.error("createBookingRequest:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// backend/src/controllers/bookingController.js

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("roomId", "roomNumber name type capacity")
      .sort({ date: 1 })
      .lean();

    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("getAllBookings:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Return all pending booking requests (status = "Pending")
export const getPendingRequests = async (req, res) => {
  try {
    const pending = await Booking.find({ status: "Pending" })
      .populate("roomId", "roomNumber name type capacity")
      .sort({ date: 1 })
      .lean();

    return res.json({ success: true, requests: pending });
  } catch (err) {
    console.error("getPendingRequests error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// 🟢 Approve or reject a booking request
export const approveBooking = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    if (!bookingId || !status)
      return res.status(400).json({ success: false, message: "bookingId and status required" });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = status; // "Approved" or "Rejected"
    await booking.save();

    return res.json({ success: true, message: `Booking ${status}`, booking });
  } catch (err) {
    console.error("approveBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// 🟠 Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId)
      return res.status(400).json({ success: false, message: "bookingId required" });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "Cancelled";
    await booking.save();

    return res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// 🟢 Get available classrooms for a given date + slot
export const getAvailableClassrooms = async (req, res) => {
  try {
    const { date, slot } = req.query;

    if (!date || !slot) {
      return res.status(400).json({
        success: false,
        message: "Both date and slot are required",
      });
    }

    // 1️⃣ Find all bookings for that date + slot
    const booked = await Booking.find({ date, slot });

    // 2️⃣ Extract roomIds that are already booked
    const bookedRoomIds = booked.map((b) => b.roomId.toString());

    // 3️⃣ Find classrooms not in bookedRoomIds
    const available = await Classroom.find({
      _id: { $nin: bookedRoomIds },
    });

    return res.json({
      success: true,
      count: available.length,
      classrooms: available,
    });
  } catch (err) {
    console.error("getAvailableClassrooms error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// 🟣 Get all bookings made by a specific faculty (via email or ID)
export const getBookingsByFaculty = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Faculty email required" });
    }

    // Find all bookings requested by this faculty
    const bookings = await Booking.find({ requestedBy: email })
      .populate("roomId", "name") // populate classroom name
      .sort({ date: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    console.error("getBookingsByFaculty error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// 🟥 Reject a booking request (admin or staff)
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking rejected", booking });
  } catch (err) {
    console.error("rejectBooking error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
