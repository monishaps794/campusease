// src/controllers/classroomController.js
import Classroom from "../models/Classroom.js";
import Booking from "../models/Booking.js";
import Timetable from "../models/Timetable.js";

/**
 * GET /classrooms/available
 * query: branch, year, section, date, slot, day
 */

export const getAvailableClassrooms = async (req, res) => {
  try {
    const { branch, date, slot } = req.query;
    if (!branch || !date || !slot) {
      return res.status(400).json({ message: "Missing required params" });
    }

    // normalize to uppercase weekday (MONDAY, TUESDAY...)
    const dayOfWeek = new Date(date)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    // --- Step 1: All classrooms of department ---
    const allRooms = await Classroom.find({ department: branch });
    const allRoomNumbers = allRooms.map((r) => r.roomNumber);

    // --- Step 2: Find timetable docs for this branch and day ---
    const timetables = await Timetable.find({ branch, day: dayOfWeek });

    // --- Step 3: Find sections having THEORY class at this slot ---
    const occupiedSections = timetables
      .filter((t) =>
        t.slots.some(
          (s) =>
            s.timeSlot === slot &&
            s.type.toUpperCase() === "THEORY" &&
            !s.subjectName.toLowerCase().includes("lab")
        )
      )
      .map((t) => `${t.year}${t.section}`);

    // --- Step 4: Use allocator’s past room assignment if available (optional) ---
    // Here, we assume rooms were assigned in order of sections (3A -> ISE101, etc.)
    const sectionToRoom = {};
    allRoomNumbers.forEach((r, i) => {
      const yr = 3 + Math.floor(i / 3); // not exact but safe default
      const sec = String.fromCharCode(65 + (i % 3));
      sectionToRoom[`${yr}${sec}`] = r;
    });

    // --- Step 5: Rooms occupied due to theory classes ---
    const timetableOccupiedRooms = occupiedSections
      .map((sec) => sectionToRoom[sec])
      .filter(Boolean);

    // --- Step 6: Also exclude booked rooms ---
    const booked = await Booking.find({
      date,
      slot,
      status: { $ne: "rejected" },
    });
    const bookedRooms = booked.map((b) => b.roomNumber);

    // --- Step 7: Filter ---
    const unavailable = new Set([...timetableOccupiedRooms, ...bookedRooms]);
    const freeRooms = allRoomNumbers.filter((r) => !unavailable.has(r));

    res.json({ availableRooms: freeRooms });
  } catch (err) {
    console.error("getAvailableClassrooms error:", err);
    res.status(500).json({ message: "Error finding rooms", error: err.message });
  }
};

/**
 * Seed sample classrooms
 */
export const seedClassrooms = async (req, res) => {
  try {
    const rooms = [
      { roomNumber: "ISE101", department: "ISE", capacity: 60 },
      { roomNumber: "ISE102", department: "ISE", capacity: 60 },
      { roomNumber: "ISE103", department: "ISE", capacity: 60 },
      { roomNumber: "ISE104", department: "ISE", capacity: 60 },
      { roomNumber: "ISE105", department: "ISE", capacity: 60 },
      { roomNumber: "ISE106", department: "ISE", capacity: 60 },
      { roomNumber: "ISE107", department: "ISE", capacity: 60 },
       // Lab rooms
      { roomNumber: "ISELAB1", department: "ISE", capacity: 60 },
    ];
    await Classroom.deleteMany({});
    await Classroom.insertMany(rooms);
    res.json({ message: "Classrooms seeded", count: rooms.length });
  } catch (err) {
    res.status(500).json({ message: "Seeding failed", error: err.message });
  }
};

/**
 * Return all classrooms
 */
export const getAllClassrooms = async (req, res) => {
  try {
    const all = await Classroom.find({});
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Fetch all failed", error: err.message });
  }
};
