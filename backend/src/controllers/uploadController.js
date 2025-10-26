// backend/src/controllers/uploadController.js
import fs from "fs";
import csv from "csv-parser";
import Timetable from "../models/Timetable.js";
import Classroom from "../models/Classroom.js";
import Faculty from "../models/Faculty.js";

/**
 * Helper: parse CSV file at given path -> returns array of rows (objects)
 */
const parseCSV = (path) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });

/**
 * POST /upload/timetable (multipart: file + branch, year, section)
 * CSV rows expected: day,slot1,slot2,... or day,timeSlot,classroom,subject per row
 */
export const uploadTimetable = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { branch, year, section } = req.body;
    if (!branch || !year || !section) {
      // accept branch/year/section either in body or inside CSV per-row
      // but require at least one source — for demo require body
      return res.status(400).json({ message: "branch, year, section required" });
    }

    const rows = await parseCSV(req.file.path);

    // For flexibility, we accept two CSV shapes:
    // 1) row: day,slot1,slot2,slot3,...
    // 2) row: day,timeSlot,classroom,subject  (multiple rows per day)
    // We'll detect by presence of timeSlot column.
    for (const row of rows) {
      if (row.timeSlot) {
        // shape 2
        const day = row.day;
        const slot = { timeSlot: row.timeSlot, classroom: row.classroom || "", subject: row.subject || "" };
        // upsert timetable entry for that day
        let tt = await Timetable.findOne({ branch, year, section, day });
        if (!tt) {
          tt = new Timetable({ branch, year, section, day, slots: [slot] });
        } else {
          tt.slots.push(slot);
        }
        await tt.save();
      } else {
        // shape 1: columns other than branch/year/section/day treated as slots
        const day = row.day;
        const slots = [];
        Object.keys(row).forEach((k) => {
          if (k !== "day" && row[k]) {
            // treat column value as subject or "classroom-subject"
            slots.push({ timeSlot: k, subject: row[k], classroom: "" });
          }
        });
        // replace existing day entry
        await Timetable.findOneAndUpdate(
          { branch, year, section, day },
          { branch, year, section, day, slots },
          { upsert: true }
        );
      }
    }

    fs.unlinkSync(req.file.path);
    return res.status(201).json({ message: "Timetable uploaded" });
  } catch (err) {
    console.error("uploadTimetable:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /upload/classrooms  (CSV file)
 * CSV expected: roomNumber,blockName,capacity
 */
export const uploadClassrooms = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const rows = await parseCSV(req.file.path);
    for (const r of rows) {
      const roomNumber = r.roomNumber || r.room || r.RoomNumber;
      const blockName = r.blockName || r.block || r.block_name;
      const capacity = r.capacity ? Number(r.capacity) : undefined;
      if (!roomNumber) continue;
      await Classroom.findOneAndUpdate(
        { roomNumber },
        { roomNumber, blockName, capacity },
        { upsert: true, new: true }
      );
    }
    fs.unlinkSync(req.file.path);
    return res.status(201).json({ message: "Classrooms uploaded" });
  } catch (err) {
    console.error("uploadClassrooms:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /upload/faculty (CSV file)
 * CSV: name,email,branch,designation
 */
export const uploadFaculty = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const rows = await parseCSV(req.file.path);
    for (const r of rows) {
      const name = r.name;
      const email = r.email;
      const branch = r.branch;
      const designation = r.designation;
      if (!email) continue;
      await Faculty.findOneAndUpdate(
        { email },
        { name, email, branch, designation },
        { upsert: true, new: true }
      );
    }
    fs.unlinkSync(req.file.path);
    return res.status(201).json({ message: "Faculty uploaded" });
  } catch (err) {
    console.error("uploadFaculty:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * POST /upload/classroom  (JSON body) - add single classroom
 * body: { roomNumber, blockName, capacity }
 */
export const addClassroom = async (req, res) => {
  try {
    const { roomNumber, blockName, capacity } = req.body;
    if (!roomNumber) return res.status(400).json({ message: "roomNumber required" });
    const existing = await Classroom.findOne({ roomNumber });
    if (existing) {
      existing.blockName = blockName || existing.blockName;
      if (capacity) existing.capacity = capacity;
      await existing.save();
      return res.json({ message: "Classroom updated", classroom: existing });
    }
    const c = new Classroom({ roomNumber, blockName, capacity });
    await c.save();
    return res.status(201).json({ message: "Classroom created", classroom: c });
  } catch (err) {
    console.error("addClassroom:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /upload/classroom/:id
 */
export const removeClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    await Classroom.findByIdAndDelete(id);
    return res.json({ message: "Classroom removed" });
  } catch (err) {
    console.error("removeClassroom:", err);
    return res.status(500).json({ message: err.message });
  }
};
