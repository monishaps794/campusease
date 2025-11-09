// backend/src/controllers/allocatorController.js
import Classroom from "../models/Classroom.js";
import Timetable from "../models/Timetable.js";
import AllocationResult from "../models/AllocationResult.js";

/* ---------------------- Fixed Rooms (stable sections) ---------------------- */
const FIXED_ROOMS = {
  "3A": "ISE101",
  "3B": "ISE102",
  "3C": "ISE103",
  "5A": "ISE104",
  "5B": "ISE105",
  "5C": "ISE106",
  "7A": "ISE107",
  "7B": "ISE108",
  // 7C is dynamic/default-manual depending on mode
};

/* ---------------------- Default Manual 7C Allocation ---------------------- */
/* This is used when you hit /allocator/restore-default */
const MANUAL_7C = {
  Monday: {
    "8:30-9:30": { room: "ISE107", subject: "DLD" },
    "9:30-10:30": { room: "ISE107", subject: "DLD" },
  },
  Tuesday: {
    "11:00-12:00": { room: "ISE107", subject: "OS" },
    "12:00-1:00": { room: "ISE107", subject: "OS" },
  },
  Wednesday: {
    "8:30-9:30": { room: "ISE108", subject: "DBMS" },
    "9:30-10:30": { room: "ISE108", subject: "DBMS" },
    "11:00-12:00": { room: "ISE103", subject: "DMS" },
    "12:00-1:00": { room: "ISE103", subject: "DMS" },
  },
  Thursday: {
    "11:00-12:00": { room: "ISE103", subject: "CN" },
    "12:00-1:00": { room: "ISE103", subject: "CN" },
    "2:00-3:00": { room: "ISE103", subject: "CN" },
  },
  Friday: {
    "11:00-12:00": { room: "ISE103", subject: "OS" },
    "12:00-1:00": { room: "ISE103", subject: "OS" },
    "2:00-3:00": { room: "ISE103", subject: "DBMS" },
  },
};

const LAB_ROOM = "ISELAB1";
const isLab = (t) => (t || "").toUpperCase().includes("LAB");
const isActivityOrNoRoom = (t) => {
  const T = (t || "").toUpperCase();
  return T === "ACTIVITY" || T === "NO_ROOM";
};

/* ---------------------- Ensure Rooms Exist ---------------------- */
export const seedISEClassrooms = async (_req, res) => {
  try {
    const want = [
      "ISE101","ISE102","ISE103","ISE104",
      "ISE105","ISE106","ISE107","ISE108",
      "ISELAB1"
    ];
    const existing = await Classroom.find({ roomNumber: { $in: want } }).lean();
    const have = new Set(existing.map(r => r.roomNumber));
    const toInsert = want
      .filter(r => !have.has(r))
      .map(r => ({
        roomNumber: r,
        department: "ISE",
        capacity: r === LAB_ROOM ? 40 : 60,
        type: r === LAB_ROOM ? "LAB" : "Lecture Hall",
      }));

    if (toInsert.length) await Classroom.insertMany(toInsert);

    return res.json({
      success: true,
      message: "ISE rooms verified/seeded",
      added: toInsert.map(x => x.roomNumber)
    });
  } catch (e) {
    console.error("seedISEClassrooms:", e);
    return res.status(500).json({ success: false, message: "Seeding failed" });
  }
};

/* ---------------------- Core Builder ---------------------- */
/**
 * mode = "rotate7c"  → 7C THEORY rotates into any free lecture hall per slot
 * mode = "manual7c"  → 7C THEORY uses MANUAL_7C mapping (default allocation)
 */
const buildAllocationFromTimetable = async (mode = "rotate7c") => {
  // Load all timetable docs for ISE
  const docs = await Timetable.find({ branch: "ISE" }).lean();

  // Collect lecture rooms in stable order (exclude lab from theory choices)
  const allRooms = await Classroom.find().lean();
  const lectureRooms = allRooms
    .filter(r => (r.type || "").toUpperCase() !== "LAB")
    .map(r => r.roomNumber)
    .sort(); // stable & deterministic

  const allocation = {};           // { "3A":[{day,slot,subject,room,type}], ... }
  const bySectionDay = {};         // { "3A": { "MONDAY":[{slot,subject,type}], ... }, ... }
  const sectionKeys = new Set();

  // Normalize timetable -> bySectionDay
  for (const t of docs) {
    const secKey = `${t.year}${t.section}`; // e.g. "7C"
    sectionKeys.add(secKey);
    if (!bySectionDay[secKey]) bySectionDay[secKey] = {};
    if (!bySectionDay[secKey][t.day]) bySectionDay[secKey][t.day] = [];

    for (const s of (t.slots || [])) {
      bySectionDay[secKey][t.day].push({
        day: t.day,                                      // keep original case from DB
        slot: s.timeSlot || s.time,
        subject: s.subjectName || s.subject,
        type: (s.type || "THEORY").toUpperCase(),
      });
    }
  }

  // First pass:
  // - Fixed sections (everything except 7C): THEORY -> fixed room; LAB -> lab; ACTIVITY/NO_ROOM -> null
  // - 7C: LAB/ACTIVITY handled; THEORY either (manual) immediate mapping OR placeholder for rotation
  for (const sec of sectionKeys) {
    allocation[sec] = [];
    const dayMap = bySectionDay[sec] || {};

    for (const day of Object.keys(dayMap)) {
      for (const s of dayMap[day]) {
        const out = {
          day,
          slot: s.slot,
          subject: s.subject || "",
          type: s.type || "THEORY",
          room: null,
        };

        if (isLab(s.type)) {
          out.room = LAB_ROOM;
        } else if (isActivityOrNoRoom(s.type)) {
          out.room = null;
        } else if (sec !== "7C") {
          // THEORY for fixed sections → fixed classroom
          out.room = FIXED_ROOMS[sec] || null;
        } else {
          // 7C THEORY
          if (mode === "manual7c") {
            // Use default manual mapping if provided
            const m = MANUAL_7C[day]?.[s.slot];
            out.room = m?.room || null; // leave null if not specified in manual
          } else {
            // rotate7c → assign later
            out.room = null;
          }
        }

        allocation[sec].push(out);
      }
    }
  }

  if (mode === "manual7c") {
    // Manual mode is done
    return allocation;
  }

  // Rotate mode: we must fill 7C THEORY by choosing free lecture rooms per slot
  // Build occupancy map from fixed sections (exclude 7C)
  // Key → `${DAY_UPPER}__${slot}` → Set(rooms already used for theory)
  const occ = new Map();
  const addOcc = (day, slot, room) => {
    if (!room) return;
    const key = `${String(day).toUpperCase()}__${slot}`;
    if (!occ.has(key)) occ.set(key, new Set());
    occ.get(key).add(room);
  };

  for (const [sec, rows] of Object.entries(allocation)) {
    if (sec === "7C") continue;
    for (const r of rows) {
      if (r.room && r.room !== LAB_ROOM && (r.type || "").toUpperCase() === "THEORY") {
        addOcc(r.day, r.slot, r.room);
      }
    }
  }

  // Assign 7C theory rooms by picking the first free lecture hall at each day+slot
  if (allocation["7C"]) {
    allocation["7C"] = allocation["7C"].map((r) => {
      if ((r.type || "").toUpperCase() !== "THEORY" || r.room) return r;

      const key = `${String(r.day).toUpperCase()}__${r.slot}`;
      const used = occ.get(key) || new Set();

      const chosen = lectureRooms.find(rr => !used.has(rr)) || null;
      if (chosen) {
        addOcc(r.day, r.slot, chosen);
        return { ...r, room: chosen };
      }
      // If nothing free, leave null (rare)
      return r;
    });
  }

  return allocation;
};

const saveAllocationMap = async (allocation) => {
  await AllocationResult.deleteMany({});
  await AllocationResult.create({ allocation });
};

/* ---------------------- Public Controllers ---------------------- */
/**
 * POST /allocator/run
 * → Fixed (3A–7B) + Rotating 7C
 */
export const runAllocator = async (_req, res) => {
  try {
    const allocation = await buildAllocationFromTimetable("rotate7c");
    await saveAllocationMap(allocation);
    return res.json({ success: true, message: "Allocator run complete", allocation });
  } catch (e) {
    console.error("runAllocator:", e);
    return res.status(500).json({ success: false, message: "Allocator failed" });
  }
};

/**
 * POST /allocator/restore-default
 * → Fixed (3A–7B) + Manual 7C (MANUAL_7C)
 */
export const restoreDefault = async (req, res) => {
  try {
    // Force use MANUAL_7C instead of rotated allocation
    const allocation = await buildAllocationFromTimetable({ forceManual7C: true });
    await saveAllocationMap(allocation);
    return res.json({ success: true, message: "Default allocation restored", allocation });
  } catch {
    return res.status(500).json({ success: false, message: "Restore failed" });
  }
};


export const saveAllocation = async (req, res) => {
  try {
    const { allocation } = req.body;
    if (!allocation || typeof allocation !== "object") {
      return res.status(400).json({ success: false, message: "Invalid allocation payload" });
    }
    await saveAllocationMap(allocation);
    return res.json({ success: true, message: "Allocation saved" });
  } catch (e) {
    console.error("saveAllocation:", e);
    return res.status(500).json({ success: false, message: "Save failed" });
  }
};

export const getLatestAllocation = async (_req, res) => {
  try {
    const latest = await AllocationResult.findOne().sort({ createdAt: -1 }).lean();
    if (!latest) return res.json({ success: false, message: "No allocations found" });
    return res.json({ success: true, allocation: latest.allocation });
  } catch (e) {
    console.error("getLatestAllocation:", e);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};
