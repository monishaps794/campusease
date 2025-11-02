import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Classroom from "../models/Classroom.js";
import Timetable from "../models/Timetable.js";

// fixed slot list
const ALL_SLOTS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];

/**
 * GET /bookings/available-by-date
 */
export const getAvailableRoomsByDate = async (req, res) => {
  try {
    const { branch, year, section, date } = req.query;
    if (!date)
      return res.status(400).json({
        success: false,
        message: "date query required (YYYY-MM-DD)",
      });

    const d = new Date(date + "T00:00:00");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[d.getDay()];

    // 1️⃣ get all classrooms (optional branch filter)
    const classroomQuery = {};
    if (branch) classroomQuery.department = branch;
    const allRooms = await Classroom.find(classroomQuery).lean();

    // 2️⃣ get all approved bookings for that date
    const approvedBookings = await Booking.find({ date, status: "approved" }).lean();

    const occupiedMap = new Map(); // room -> Set(slots)
    const markOccupied = (key, slot) => {
      if (!occupiedMap.has(key)) occupiedMap.set(key, new Set());
      occupiedMap.get(key).add(slot);
    };

    // mark occupied from bookings
    for (const b of approvedBookings) {
      if (b.roomNumber) markOccupied(b.roomNumber, b.slot);
      if (b.roomId) markOccupied(String(b.roomId), b.slot);
    }

    // 3️⃣ mark timetable conflicts
    if (branch && year && section) {
      const tts = await Timetable.find({ branch, year, section, day: dayName }).lean();
      for (const tt of tts) {
        for (const s of tt.slots || []) {
          const sTime = s.timeSlot || s.time || s.timeRange || "";
          if (!sTime) continue;
          if (s.classroom) {
            if (typeof s.classroom === "string") markOccupied(s.classroom, sTime);
            else if (mongoose.isValidObjectId(s.classroom))
              markOccupied(String(s.classroom), sTime);
          }
        }
      }
    }

    // 4️⃣ compute available slots for each room
    const roomsResult = allRooms.map((r) => {
      const idKey = String(r._id);
      const rnKey = r.roomNumber || idKey;
      const occ = new Set();
      if (occupiedMap.has(idKey)) for (const s of occupiedMap.get(idKey)) occ.add(s);
      if (occupiedMap.has(rnKey)) for (const s of occupiedMap.get(rnKey)) occ.add(s);

      const freeSlots = ALL_SLOTS.filter((slot) => !occ.has(slot));
      return { roomId: idKey, roomNumber: rnKey, freeSlots };
    });

    const availableRooms = roomsResult.filter((r) => r.freeSlots.length > 0);
    return res.json({ success: true, date, day: dayName, availableRooms });
  } catch (err) {
    console.error("getAvailableRoomsByDate:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/**
 * POST /bookings/admin/book
 */
export const createAdminBooking = async (req, res) => {
  try {
    let { roomId, roomNumber, date, slot, branch, year, section, reason, requestedBy } = req.body;
    if (!date || !slot || !(roomId || roomNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "roomId/roomNumber, date and slot are required" });
    }

    // resolve roomId if only number given
    if (!roomId && roomNumber) {
      const found = await Classroom.findOne({ roomNumber }).lean();
      if (found) roomId = found._id;
    }

    // prevent duplicate booking
    const conflict = await Booking.findOne({
      date,
      slot,
      status: "approved",
      $or: [{ roomId }, { roomNumber }],
    });
    if (conflict) {
      return res
        .status(409)
        .json({ success: false, message: "Room already booked for that slot" });
    }

    const newBooking = await Booking.create({
      roomId,
      roomNumber,
      date,
      slot,
      branch,
      year,
      section,
      reason: reason || "Admin booking",
      requestedBy: requestedBy || "admin",
      status: "approved",
      createdAt: new Date(),
    });

    return res
      .status(201)
      .json({ success: true, message: "Room booked successfully", booking: newBooking });
  } catch (err) {
    console.error("createAdminBooking:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ===== OLD FUNCTIONS KEPT AS REQUIRED =====
export const getAvailableClassrooms = async (req, res) => {
  try {
    const rooms = await Classroom.find({}).lean();
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createBookingRequest = async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, status: "pending" });
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingsByFaculty = async (req, res) => {
  try {
    const bookings = await Booking.find({ requestedBy: req.params.email })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, total: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
