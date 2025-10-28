// backend/src/controllers/allocationController.js
import Classroom from "../models/Classroom.js";

export const autoAllocate = async (req, res) => {
  try {
    const sections = [
      { branch: "ISE", year: 3, section: "A" },
      { branch: "ISE", year: 3, section: "B" },
      { branch: "ISE", year: 3, section: "C" },
      { branch: "ISE", year: 3, section: "D" },
      { branch: "ISE", year: 3, section: "E" },
      { branch: "ISE", year: 3, section: "F" },
      { branch: "ISE", year: 3, section: "G" },
      { branch: "ISE", year: 3, section: "H" },
      { branch: "ISE", year: 3, section: "I" },
    ];

    const rooms = await Classroom.find({ blocked: { $ne: true } })
      .sort({ roomNumber: 1 })
      .lean();

    if (!rooms.length) return res.status(400).json({ message: "No classrooms found" });

    // Simple round-robin assignment
    const allocation = sections.map((sec, i) => ({
      ...sec,
      assignedRoom: rooms[i % rooms.length].roomNumber,
    }));

    return res.json({ success: true, allocation });
  } catch (err) {
    console.error("autoAllocate error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
