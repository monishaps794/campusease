// backend/src/controllers/allocatorController.js
import Classroom from "../models/Classroom.js";
import Timetable from "../models/Timetable.js";
import AllocationResult from "../models/AllocationResult.js";
import AllocatorMeta from "../models/AllocatorMeta.js";
import AllocatorLog from "../models/AllocatorLog.js";
// NOTE: server.js exports `io` in your repo. Adjust path if you export io somewhere else.
import { io } from "../../server.js";

/* ---------------------- Fixed Rooms ---------------------- */
const FIXED_ROOMS = {
  "3A": "ISE101",
  "3B": "ISE102",
  "3C": "ISE103",
  "5A": "ISE104",
  "5B": "ISE105",
  "5C": "ISE106",
  "7A": "ISE107",
  "7B": "ISE108",
  // 7C is dynamic (rotated) or manual depending on mode
};

/* ---------------------- Manual Default 7C ---------------------- */
const MANUAL_7C = {
  Monday: {
    "8:30-9:30": { room: "ISE107", subject: "BIG DATA" },
    "9:30-10:30": { room: "ISE107", subject: "NETWORK SECURITY" },
    "11:00-12:00": { room: "ISELAB1", subject: "BIG DATA/IOT" },
    "12:00-1:00": { room: "ISELAB1", subject: "BIG DATA/IOT" },
  },
  Tuesday: {
    "11:00-12:00": { room: "ISE102", subject: "NETWORK SECURITY" },
    "12:00-1:00": { room: "ISE102", subject: "IOT" },
  },
  Wednesday: {
    "8:30-9:30": { room: "ISE108", subject: "IOT" },
    "9:30-10:30": { room: "ISE108", subject: "NETWORK SECURITY" },
    "11:00-12:00": { room: "ISE103", subject: "DEEP LEARNING/IR" },
    "12:00-1:00": { room: "ISE103", subject: "IOT" },
  },
  Thursday: {
    "8:30-9:30": { room: "ISELAB1", subject: "BIG DATA/IOT" },
    "9:30-10:30": { room: "ISELAB1", subject: "BIG DATA/IOT" },
    "11:00-12:00": { room: "ISE101", subject: "IOT" },
    "12:00-1:00": { room: "ISE101", subject: "BIG DATA" },
    "2:00-3:00": { room: "ISE101", subject: "DEEP LEARNING/IR" },
  },
  Friday: {
    "11:00-12:00": { room: "ISE101", subject: "DEEP LEARNING/IR" },
    "12:00-1:00": { room: "ISE101", subject: "NETWORK SECURITY" },
  },
};

const LAB_ROOM = "ISELAB1";
const isLab = (t) => (t || "").toUpperCase().includes("LAB");
const isActivityOrNoRoom = (t) => {
  const T = (t || "").toUpperCase();
  return T === "ACTIVITY" || T === "NO_ROOM";
};

/* Uppercase day mapping for quicker lookups in manual mode */
const MANUAL_7C_UPPER = Object.fromEntries(
  Object.entries(MANUAL_7C).map(([k, v]) => [k.toUpperCase(), v])
);

/* ---------------------- Seed Classrooms ---------------------- */
export const seedISEClassrooms = async (_req, res) => {
  try {
    const want = [
      "ISE101", "ISE102", "ISE103", "ISE104",
      "ISE105", "ISE106", "ISE107", "ISE108",
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
    return res.json({ success: true, message: "ISE rooms verified/seeded", added: toInsert.map(x => x.roomNumber) });
  } catch (e) {
    console.error("seedISEClassrooms:", e);
    return res.status(500).json({ success: false, message: "Seeding failed" });
  }
};

/* ---------------------- Core Allocator ---------------------- */
const buildAllocationFromTimetable = async (mode = "rotate7c") => {
  // Accept object-style parameter for backward compatibility
  if (typeof mode === "object") {
    mode = mode.mode || (mode.forceManual7C ? "manual7c" : "rotate7c");
  }
  mode = String(mode || "rotate7c");

  // Load timetable and rooms
  const docs = await Timetable.find({ branch: "ISE" }).lean();
  const allRooms = await Classroom.find().lean();

  // Candidate lecture rooms (exclude labs)
  const lectureRooms = allRooms
    .filter(r => (r.type || "").toUpperCase() !== "LAB")
    .map(r => r.roomNumber)
    .sort();

  // Build normalized structure: bySectionDay
  const allocation = {};
  const bySectionDay = {};
  const sectionKeys = new Set();

  for (const t of docs) {
    const secKey = `${t.year}${t.section}`; // e.g. "7C"
    sectionKeys.add(secKey);
    if (!bySectionDay[secKey]) bySectionDay[secKey] = {};
    if (!bySectionDay[secKey][t.day]) bySectionDay[secKey][t.day] = [];

    for (const s of (t.slots || [])) {
      bySectionDay[secKey][t.day].push({
        day: t.day,
        slot: s.timeSlot || s.time,
        subject: s.subjectName || s.subject,
        type: (s.type || "THEORY").toUpperCase(),
      });
    }
  }

  // Base allocation for each section/day/slot
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

        if (isLab(s.type)) out.room = LAB_ROOM;
        else if (isActivityOrNoRoom(s.type)) out.room = null;
        else if (sec !== "7C") out.room = FIXED_ROOMS[sec] || null;
        // for 7C, keep room null for later assignment
        allocation[sec].push(out);
      }
    }
  }

  /* ---------------------- Manual 7C mode ---------------------- */
  if (mode === "manual7c") {
    if (allocation["7C"]) {
      allocation["7C"] = allocation["7C"].map(r => {
        if ((r.type || "").toUpperCase() !== "THEORY") return r;
        const m = MANUAL_7C_UPPER[String(r.day).toUpperCase()]?.[r.slot];
        if (m) return { ...r, room: m.room, subject: m.subject || r.subject };
        return r;
      });
    }
    return allocation;
  }

  /* ---------------------- Rotate 7C mode ---------------------- */
  // Build occupancy map from fixed sections (exclude 7C)
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

  // Determine startIndex from persistent pointer. Guard if no lecture rooms.
  let startIndex = 0;
  if (lectureRooms.length > 0) {
    let meta = await AllocatorMeta.findOne({ key: "rotationIndex" });
    if (!meta) {
      meta = await AllocatorMeta.create({ key: "rotationIndex", value: 0 });
    }
    startIndex = meta.value % lectureRooms.length;
    // increment pointer for next run (persist) — automatic one-line tweak you requested
    meta.value = (meta.value + 1) % lectureRooms.length;
    await meta.save();
  }

  // Fill 7C THEORY slots by selecting first non-occupied lecture room scanning from startIndex (circular)
  if (allocation["7C"]) {
    allocation["7C"] = allocation["7C"].map(r => {
      if ((r.type || "").toUpperCase() !== "THEORY" || r.room) return r;
      const key = `${String(r.day).toUpperCase()}__${r.slot}`;
      const used = occ.get(key) || new Set();

      let chosen = null;
      for (let i = 0; i < lectureRooms.length; i++) {
        const idx = (startIndex + i) % lectureRooms.length;
        const candidate = lectureRooms[idx];
        if (!used.has(candidate)) {
          chosen = candidate;
          break;
        }
      }

      if (chosen) {
        addOcc(r.day, r.slot, chosen);
        return { ...r, room: chosen };
      }
      // leave null if no free room found
      return r;
    });
  }

  return allocation;
};

/* ---------------------- Save/Controllers ---------------------- */
const saveAllocationMap = async (allocation) => {
  // keep only latest semantics (delete old and store new)
  await AllocationResult.deleteMany({});
  await AllocationResult.create({ allocation });
};

export const runAllocator = async (_req, res) => {
  try {
    const allocation = await buildAllocationFromTimetable("rotate7c");
    await saveAllocationMap(allocation);

    // create log entry (pointer stored in AllocatorMeta)
    const pointerValue = (await AllocatorMeta.findOne({ key: "rotationIndex" }))?.value ?? 0;
    await AllocatorLog.create({
      mode: "rotate7c",
      pointerIndex: pointerValue,
      message: "Allocator run completed",
    });

    // Notify connected clients (socket)
    try {
      io.emit("allocator:update", {
        message: "Allocator run completed successfully.",
        pointerIndex: pointerValue,
        mode: "rotate7c",
        timestamp: new Date(),
      });
    } catch (emitErr) {
      console.warn("runAllocator: socket emit failed", emitErr);
    }

    return res.json({ success: true, message: "Allocator run complete", allocation });
  } catch (e) {
    console.error("runAllocator:", e);
    return res.status(500).json({ success: false, message: "Allocator failed" });
  }
};

export const restoreDefault = async (_req, res) => {
  try {
    const allocation = await buildAllocationFromTimetable("manual7c");
    await saveAllocationMap(allocation);

    const pointerValue = (await AllocatorMeta.findOne({ key: "rotationIndex" }))?.value ?? 0;
    await AllocatorLog.create({
      mode: "manual7c",
      pointerIndex: pointerValue,
      message: "Default allocation restored",
    });

    // Notify via socket
    try {
      io.emit("allocator:restore", {
        message: "Default allocation restored successfully.",
        pointerIndex: pointerValue,
        mode: "manual7c",
        timestamp: new Date(),
      });
    } catch (emitErr) {
      console.warn("restoreDefault: socket emit failed", emitErr);
    }

    return res.json({ success: true, message: "Default allocation restored", allocation });
  } catch (e) {
    console.error("restoreDefault:", e);
    return res.status(500).json({ success: false, message: "Restore failed" });
  }
};

export const saveAllocation = async (req, res) => {
  try {
    const { allocation } = req.body;
    if (!allocation || typeof allocation !== "object")
      return res.status(400).json({ success: false, message: "Invalid allocation payload" });
    await saveAllocationMap(allocation);

    // log a manual save
    const pointerValue = (await AllocatorMeta.findOne({ key: "rotationIndex" }))?.value ?? 0;
    await AllocatorLog.create({
      mode: "save",
      pointerIndex: pointerValue,
      message: "Allocation saved manually via API",
    });

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

export const resetRotationPointer = async (req, res) => {
  try {
    // admin-only (assumes req.user is set by your auth middleware)
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await AllocatorMeta.findOneAndUpdate(
      { key: "rotationIndex" },
      { value: 0 },
      { upsert: true, new: true }
    );

    await AllocatorLog.create({
      mode: "reset-pointer",
      pointerIndex: 0,
      message: "Rotation pointer reset to 0 by admin",
    });

    try {
      io.emit("allocator:reset", {
        message: "Rotation pointer reset to 0 by admin.",
        pointerIndex: 0,
        timestamp: new Date(),
      });
    } catch (emitErr) {
      console.warn("resetRotationPointer: socket emit failed", emitErr);
    }

    return res.json({
      success: true,
      message: "Rotation pointer reset to 0 successfully",
      pointer: result,
    });
  } catch (err) {
    console.error("resetRotationPointer:", err);
    return res.status(500).json({ success: false, message: "Reset failed" });
  }
};

export const getAllocatorStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const pointerDoc = await AllocatorMeta.findOne({ key: "rotationIndex" }).lean();
    const latestAllocation = await AllocationResult.findOne().sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      pointerIndex: pointerDoc?.value ?? 0,
      lastRunAt: latestAllocation?.createdAt || null,
      allocationMode: latestAllocation ? detectAllocationMode(latestAllocation.allocation) : "unknown",
    });
  } catch (err) {
    console.error("getAllocatorStatus:", err);
    return res.status(500).json({ success: false, message: "Status fetch failed" });
  }
};

/** Detect allocator mode from allocation data heuristically */
function detectAllocationMode(allocation) {
  if (!allocation || !allocation["7C"]) return "unknown";
  const rows = allocation["7C"].filter(r => (r.type || "").toUpperCase() === "THEORY");

  // Count how many theory slots match the manual mapping (room equals manual mapping)
  let manualMatches = 0;
  for (const r of rows) {
    const dayMap = MANUAL_7C_UPPER[String(r.day).toUpperCase()] || {};
    const m = dayMap[r.slot];
    if (m && m.room && r.room === m.room) manualMatches++;
  }
  // If many matches to manual mapping exist, call it manual7c
  if (manualMatches >= Math.max(1, Math.floor(rows.length * 0.25))) return "manual7c";
  return "rotate7c";
}

export const getAllocatorLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const logs = await AllocatorLog.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, logs });
  } catch (err) {
    console.error("getAllocatorLogs:", err);
    return res.status(500).json({ success: false, message: "Fetch logs failed" });
  }
};
