import Classroom from "../models/Classroom.js";
import Booking from "../models/Booking.js";

export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json({ success: true, classrooms });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch classrooms" });
  }
};

export const seedClassrooms = async (req, res) => {
  try {
    const existing = await Classroom.find({ roomNumber: { $regex: /^ISE/ } });
    if (existing.length >= 8) {
      return res.json({ success: true, message: "Already seeded" });
    }
    const list = [
      { roomNumber: "ISE101", department: "ISE", capacity: 60 },
      { roomNumber: "ISE102", department: "ISE", capacity: 60 },
      { roomNumber: "ISE103", department: "ISE", capacity: 60 },
      { roomNumber: "ISE104", department: "ISE", capacity: 60 },
      { roomNumber: "ISE105", department: "ISE", capacity: 60 },
      { roomNumber: "ISE106", department: "ISE", capacity: 60 },
      { roomNumber: "ISE107", department: "ISE", capacity: 60 },
      { roomNumber: "ISE108", department: "ISE", capacity: 60 }
    ];
    await Classroom.insertMany(list);
    res.json({ success: true, classrooms: list });
  } catch (err) {
    res.status(500).json({ success: false, error: "Seed failed" });
  }
};

export const getAvailableClassrooms = async (req, res) => {
  try {
    const { date, slot } = req.query;
    const all = await Classroom.find();
    const booked = await Booking.find({ date, slot, status: "approved" }).populate("roomId");
    const bookedSet = new Set(booked.map(b => b.roomId.roomNumber));
    const available = all.filter(r => !bookedSet.has(r.roomNumber));
    res.json({ success: true, available });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get availability" });
  }
};

export const getClassroomDetails = async (req, res) => {
  try {
    const room = await Classroom.findOne({ roomNumber: req.params.roomNumber });
    if (!room) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, classroom: room });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch details" });
  }
};
