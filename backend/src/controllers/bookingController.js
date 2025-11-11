import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Classroom from "../models/Classroom.js";
import AllocationResult from "../models/AllocationResult.js";
import User from "../models/User.js";
import Notification from "../models/notification.js";

/* -------------------------- Helpers -------------------------- */
const norm = (s) => (s ? String(s).trim() : "");

const weekdayFromISO = (iso) => {
  const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return days[d.getDay()];
};

/* =====================================================================
   ✅ SINGLE SOURCE OF TRUTH: getAvailableClassrooms
   Uses:
   - Latest AllocationResult (timetable → rooms reserved per day/slot)
   - Approved bookings (DB)
   - 7C reserved rooms
   Returns three buckets: available, booked, reserved7C
   ===================================================================== */
export const getAvailableClassrooms = async (req, res) => {
  try {
    const { date, slot } = req.query;
    if (!date || !slot) {
      return res.status(400).json({ success:false, message:"date & slot required" });
    }

    const day = weekdayFromISO(date); // "MONDAY".."SUNDAY"
    if (!day) return res.status(400).json({ success:false, message:"Invalid date" });

    // 1) all rooms
    const allRooms = await Classroom.find().lean();

    // 2) timetable allocation (latest)
    const latest = await AllocationResult.findOne().sort({ createdAt:-1 }).lean();
    const allocation = latest?.allocation || {};

    const reserved7CSet = new Set();
    const scheduledSet = new Set(); // fixed rooms for other sections

    for (const [sec, recs] of Object.entries(allocation)) {
      if (!Array.isArray(recs)) continue;
      for (const c of recs) {
        const cday = (c.day || "").toUpperCase();
        const cslot = c.slot || c.time;
        const room = c.room || c.roomNumber;
        if (!room) continue;
        if (cday === day && cslot === slot) {
          if (sec === "7C") reserved7CSet.add(room);
          else scheduledSet.add(room);
        }
      }
    }

    // 3) approved bookings (DB)
    const approved = await Booking.find({ date, slot, status:"approved" }).lean();
    // Build roomId→roomNumber map to handle older docs
    const idByNumber = new Map(allRooms.map(r => [String(r._id), r.roomNumber]));
    const bookedSet = new Set(
      approved.map(b => b.roomNumber || idByNumber.get(String(b.roomId)) ).filter(Boolean)
    );

    const available = [];
    const booked = [];
    const reserved7C = [];

    for (const r of allRooms) {
      const rn = r.roomNumber;

      if (reserved7CSet.has(rn)) {
        reserved7C.push({ roomNumber: rn, type: r.type });
      } else if (scheduledSet.has(rn) || bookedSet.has(rn)) {
        booked.push({ roomNumber: rn, type: r.type });
      } else {
        available.push({ roomNumber: rn, type: r.type });
      }
    }

    // (Optional) keep LAB last client-side; here we just return lists.
    return res.json({ success:true, available, booked, reserved7C });

  } catch (err) {
    console.error("getAvailableClassrooms ERROR:", err);
    return res.status(500).json({ success:false, message:"Server error" });
  }
};

/* =====================================================================
   Faculty → create pending booking
   ===================================================================== */
export const createBookingRequest = async (req, res) => {
  try {
    let { facultyEmail, roomNumber, date, slot, reason, branch, year, section } = req.body;
    facultyEmail = norm(facultyEmail);
    roomNumber = norm(roomNumber);

    if (!facultyEmail || !roomNumber || !date || !slot)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const room = await Classroom.findOne({ roomNumber });
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    const exists = await Booking.findOne({ roomNumber, date, slot, status: "approved" });
    if (exists) return res.status(409).json({ success: false, message: "Room already booked" });

    const booking = await Booking.create({
      facultyEmail: facultyEmail.toLowerCase(),
      requestedBy: facultyEmail.toLowerCase(),
      roomId: room._id,
      roomNumber,
      date,
      slot,
      reason: reason || "",
      branch,
      year,
      section,
      status: "pending",
    });

    // 🔔 Notify admins about new request
    try {
      await Notification.create({
        scope: "admin",
        title: "New Booking Request",
        message: `${facultyEmail} requested ${roomNumber} on ${date} at ${slot}.`,
        bookingId: booking._id,
      });
    } catch (e) {
      console.warn("Notification(createBookingRequest) warn:", e?.message || e);
    }

    return res.json({ success: true, message: "Request submitted", booking });
  } catch (err) {
    console.error("createBookingRequest:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================================
   Admin → direct book (auto-approved) + optional override
   override = true → cancels pending/approved conflicting bookings first
   ===================================================================== */
export const adminBook = async (req, res) => {
  try {
    const { roomNumber: rawRoomNumber, date, slot, reason, branch, year, section, override } = req.body;
    const roomNumber = norm(rawRoomNumber);
    if (!roomNumber || !date || !slot)
      return res.status(400).json({ success: false, message: "roomNumber, date, slot required" });

    const room = await Classroom.findOne({ roomNumber });
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    if (override) {
      await Booking.updateMany(
        { roomNumber, date, slot, status: { $in: ["pending", "approved"] } },
        { $set: { status: "cancelled", cancelledBy: "admin" } }
      );
    } else {
      const exists = await Booking.findOne({ roomNumber, date, slot, status: "approved" });
      if (exists) return res.status(409).json({ success: false, message: "Room already booked (use override)" });
    }

    const booking = await Booking.create({
      roomId: room._id,
      roomNumber,
      date,
      slot,
      branch,
      year,
      section,
      reason: reason || `Admin direct booking (${section || ""})`,
      facultyEmail: "admin@campusease",
      requestedBy: "admin@campusease",
      approvedBy: "admin",
      status: "approved",
    });

    // 🔔 Notify section (students) immediately
    try {
      await Notification.create({
        scope: "student-section",
        department: branch,
        year,
        section,
        title: "Classroom Booked",
        message: `${section} has been allocated ${roomNumber} at ${slot} on ${date}.`,
        bookingId: booking._id,
      });
    } catch (e) {
      console.warn("Notification(adminBook) warn:", e?.message || e);
    }

    return res.json({ success: true, message: "Admin booking confirmed", booking });
  } catch (err) {
    console.error("adminBook:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelByTriplet = async (req, res) => {
  try {
    const { roomNumber, date, slot } = req.query;
    if (!roomNumber || !date || !slot)
      return res.status(400).json({ success: false, message: "roomNumber, date, slot required" });

    const room = await Classroom.findOne({ roomNumber });
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found" });

    const booking = await Booking.findOne({
      roomId: room._id,
      date,
      slot,
      status: "approved"
    });

    if (!booking)
      return res.json({ success: true, message: "No active booking to cancel." });

    booking.status = "cancelled";
    booking.cancelledBy = "admin";
    await booking.save();

    return res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    console.error("cancelByTriplet:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================================
   Queries / Admin decisions
   ===================================================================== */
export const getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId", "roomNumber type capacity").sort({ date: 1, slot: 1 }).lean();
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("getAllBookings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingsByFaculty = async (req, res) => {
  try {
    const email = norm(req.params.email).toLowerCase();
    const bookings = await Booking.find({
      $or: [{ facultyEmail: email }, { requestedBy: email }],
    }).populate("roomId", "roomNumber").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("getBookingsByFaculty:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingRequests = async (_req, res) => {
  try {
    const pending = await Booking.find({ status: "pending" })
      .populate("roomId", "roomNumber type capacity")
      .sort({ date: 1, slot: 1 })
      .lean();
    return res.json({ success: true, requests: pending });
  } catch (err) {
    console.error("getPendingRequests:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "invalid id" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "not found" });

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      roomNumber: booking.roomNumber,
      date: booking.date,
      slot: booking.slot,
      status: "approved",
    });

    if (conflict) return res.status(409).json({ success: false, message: "Conflict: already approved" });

    booking.status = "approved";
    booking.approvedBy = "admin";
    await booking.save();

    // 🔔 Notify faculty and section on approval
    try {
      await Notification.create({
        scope: "faculty",
        facultyEmail: (booking.facultyEmail || booking.requestedBy || "").toLowerCase(),
        title: "Booking Approved",
        message: `${booking.roomNumber} on ${booking.date} at ${booking.slot} was approved.`,
        bookingId: booking._id,
      });

      await Notification.create({
        scope: "student-section",
        department: booking.branch,
        year: booking.year,
        section: booking.section,
        title: "Classroom Booked",
        message: `${booking.section} has booked ${booking.roomNumber} at ${booking.slot} on ${booking.date}.`,
        bookingId: booking._id,
      });
    } catch (e) {
      console.warn("Notification(approveBooking) warn:", e?.message || e);
    }

    return res.json({ success: true, message: "Approved", booking });
  } catch (err) {
    console.error("approveBooking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "invalid id" });

    const booking = await Booking.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: "not found" });

    // 🔔 Notify faculty on rejection
    try {
      await Notification.create({
        scope: "faculty",
        facultyEmail: (booking.facultyEmail || booking.requestedBy || "").toLowerCase(),
        title: "Booking Rejected",
        message: `${booking.roomNumber} on ${booking.date} at ${booking.slot} was rejected.`,
        bookingId: booking._id,
      });
    } catch (e) {
      console.warn("Notification(rejectBooking) warn:", e?.message || e);
    }

    return res.json({ success: true, message: "Rejected", booking });
  } catch (err) {
    console.error("rejectBooking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "invalid id" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "not found" });

    booking.status = "cancelled";
    booking.cancelledBy = "admin";
    await booking.save();

    return res.json({ success: true, message: "Cancelled", booking });
  } catch (err) {
    console.error("cancelBooking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const { roomNumber, date, slot } = req.query;
    if (!roomNumber || !date || !slot) {
      return res.status(400).json({ success:false, message:"roomNumber, date, slot required" });
    }

    const booking = await Booking.findOne({ roomNumber, date, slot }).lean();
    return res.json({ success:true, booking });
  } catch (err) {
    console.error("getBookingDetails:", err);
    return res.status(500).json({ success:false, message:"Server error" });
  }
};

/* =====================================================================
   ✅ UPDATED: Student Section Bookings
   - Accepts flexible branch ("ISE" or "Information Science")
   - Accepts section "A" or "3A" (year+letter)
   - `from`/`to` are OPTIONAL; if omitted, returns all approved
   - Populates roomId to include roomNumber (for existing UI)
   ===================================================================== */
export const getSectionBookings = async (req, res) => {
  try {
    let { branch, year, section, from, to } = req.query;

    // Normalize inputs (but do NOT break existing saved values)
    const y = norm(year).replace(/\D/g, ""); // "3"
    const secLetter = norm(section).toUpperCase().replace(/^\d+/, ""); // "A"
    const secVariants = [...new Set([secLetter, y && secLetter ? `${y}${secLetter}` : null].filter(Boolean))]; // ["A","3A"]

    // Branch variants (support both code and full name)
    const BMAP = {
      "ISE": "INFORMATION SCIENCE",
      "CSE": "COMPUTER SCIENCE",
      "ECE": "ELECTRONICS & COMMUNICATION",
      "EEE": "ELECTRICAL & ELECTRONICS",
    };
    const bIn = norm(branch).toUpperCase();
    let branchVariants = [];
    if (bIn) {
      if (BMAP[bIn]) branchVariants = [bIn, BMAP[bIn]];
      else {
        const code = Object.keys(BMAP).find(k => BMAP[k] === bIn);
        if (code) branchVariants = [code, bIn];
        else if (bIn.includes("INFORMATION")) branchVariants = ["ISE", "INFORMATION SCIENCE"];
        else branchVariants = [bIn];
      }
    }

    // Build Mongo query
    const q = { status: "approved" };
    if (branchVariants.length) q.branch = { $in: branchVariants };
    if (y) q.year = y;
    if (secVariants.length) q.section = { $in: secVariants };

    if (from || to) {
      const dateFilter = {};
      if (from) dateFilter.$gte = from;
      if (to) dateFilter.$lte = to;
      q.date = dateFilter;
    }

    const list = await Booking.find(q)
      .populate("roomId", "roomNumber")
      .sort({ date: 1, slot: 1 })
      .lean();

    // attach facultyName if possible
    const emails = Array.from(
      new Set(list.map(b => (b.facultyEmail || b.requestedBy)).filter(Boolean).map(e => e.toLowerCase()))
    );
    const users = emails.length ? await User.find({ email: { $in: emails } }, { name:1, email:1 }).lean() : [];
    const nameByEmail = new Map(users.map(u => [u.email.toLowerCase(), u.name]));

    const out = list.map(b => ({
      _id: b._id,
      roomNumber: b.roomNumber || b.roomId?.roomNumber || "",
      roomId: b.roomId ? { roomNumber: b.roomId.roomNumber } : undefined, // keep old UI safe
      date: b.date,
      slot: b.slot,
      reason: b.reason || "",
      status: b.status,
      requestedBy: b.requestedBy || "",
      facultyEmail: b.facultyEmail || "",
      facultyName:
        nameByEmail.get((b.facultyEmail || b.requestedBy || "").toLowerCase()) ||
        (b.facultyEmail || b.requestedBy || ""),
      branch: b.branch,
      year: b.year,
      section: b.section,
    }));

    return res.json({ success:true, bookings: out, count: out.length });
  } catch (err) {
    console.error("getSectionBookings:", err);
    return res.status(500).json({ success:false, message:"Server error" });
  }
};
