// src/controllers/allocatorController.js
import Timetable from "../models/Timetable.js";
import Classroom from "../models/Classroom.js";

export const runAllocatorController = async (req, res) => {
  try {
    const baseAllocations = {
      "3A": "ISE101",
      "3B": "ISE102",
      "3C": "ISE103",
      "5A": "ISE104",
      "5B": "ISE105",
      "5C": "ISE106",
      "7A": "ISE107",
    };

    const timetables = await Timetable.find({ branch: "ISE" });
    if (!timetables || timetables.length === 0)
      return res.status(404).json({ message: "No timetables found in DB" });

    const classrooms = await Classroom.find({ department: "ISE" });
    const availableRooms = classrooms.map((r) => r.roomNumber);

    // --- Build section timetable lookup ---
    const sectionMap = {};
    for (const tt of timetables) {
      const sectionKey = `${tt.year}${tt.section}`;
      if (!sectionMap[sectionKey]) sectionMap[sectionKey] = {};
      sectionMap[sectionKey][tt.day] = tt.slots.map((s) => s.subjectName || "");
    }

    const allocation = {};
    const occupied = {}; // key: `${day}-${period}` = list of rooms in use

    // 1️⃣ Mark base allocations
    Object.entries(baseAllocations).forEach(([section, room]) => {
      allocation[section] = room;
    });

    // 2️⃣ Build a map of when each base classroom is actually free
    const freeMap = {}; // key: day-period → [rooms free]
    for (const [section, room] of Object.entries(baseAllocations)) {
      const tt = sectionMap[section];
      if (!tt) continue;
      for (const [day, periods] of Object.entries(tt)) {
        periods.forEach((p, i) => {
          const key = `${day}-${i}`;
          // If it's a lab → room is FREE this period
          if (p && p.toLowerCase().includes("lab")) {
            if (!freeMap[key]) freeMap[key] = [];
            freeMap[key].push(room);
          } else {
            // Otherwise, it's occupied
            if (!occupied[key]) occupied[key] = [];
            occupied[key].push(room);
          }
        });
      }
    }

    // 3️⃣ Allocate for 7B, 7C
    const extraSections = ["7B", "7C"];
    for (const section of extraSections) {
      const tt = sectionMap[section];
      allocation[section] = {};
      if (!tt) continue;

      for (const [day, periods] of Object.entries(tt)) {
        allocation[section][day] = [];
        periods.forEach((p, i) => {
          const key = `${day}-${i}`;
          // if lab → stays in lab
          if (p && p.toLowerCase().includes("lab")) {
            allocation[section][day].push("LAB");
            return;
          }

          const occupiedRooms = occupied[key] || [];
          const freeRooms = freeMap[key] || [];

          // Try to use a free base room first
          const reusable = freeRooms.find((r) => !occupiedRooms.includes(r));
          if (reusable) {
            allocation[section][day].push(reusable);
            if (!occupied[key]) occupied[key] = [];
            occupied[key].push(reusable);
          } else {
            // Else use any unoccupied available room
            const fallback = availableRooms.find((r) => !occupiedRooms.includes(r));
            if (fallback) {
              allocation[section][day].push(fallback);
              if (!occupied[key]) occupied[key] = [];
              occupied[key].push(fallback);
            } else {
              allocation[section][day].push("NO_ROOM");
            }
          }
        });
      }
    }

    res.status(200).json({
      message: "Allocator completed successfully",
      allocation,
    });
  } catch (err) {
    console.error("Allocator error:", err);
    res.status(500).json({ message: "Allocator failed", error: err.message });
  }
};
export const saveAllocationController = async (req, res) => {
  try {
    const { allocation } = req.body;
    if (!allocation) return res.status(400).json({ message: "No allocation data provided" });
    // TODO: save to DB (e.g., Allocation collection)
    console.log("Allocation saved:", allocation);
    res.json({ message: "Allocation saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving allocation", error: err.message });
  }
};
