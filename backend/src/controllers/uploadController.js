// src/controllers/uploadController.js
import csv from "csvtojson";
import Classroom from "../models/Classroom.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

/**
 * POST /upload/classrooms
 * Body: { data: [ {roomNumber, blockName, capacity} ] } OR CSV file
 */
export const uploadClassrooms = async (req, res) => {
  try {
    let classrooms = [];

    if (req.file) {
      classrooms = await csv().fromString(req.file.buffer.toString());
    } else if (req.body.data) {
      classrooms = req.body.data;
    }

    if (!classrooms.length) {
      return res.status(400).json({ message: "No classroom data provided." });
    }

    const created = await Classroom.insertMany(classrooms, { ordered: false });
    res.status(201).json({ success: true, count: created.length });
  } catch (err) {
    console.error("uploadClassrooms:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /upload/faculty
 * Body: { data: [ {name, email, department, designation} ] }
 */
export const uploadFaculty = async (req, res) => {
  try {
    let facultyList = [];

    if (req.file) {
      facultyList = await csv().fromString(req.file.buffer.toString());
    } else if (req.body.data) {
      facultyList = req.body.data;
    }

    if (!facultyList.length) {
      return res.status(400).json({ message: "No faculty data provided." });
    }

    const formatted = facultyList.map((f) => ({
      ...f,
      email: f.email?.toLowerCase(),
      role: "faculty",
    }));

    const created = await User.insertMany(formatted, { ordered: false });
    res.status(201).json({ success: true, count: created.length });
  } catch (err) {
    console.error("uploadFaculty:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /upload/timetable
 * Accepts:
 *   - CSV file: columns [branch,year,section,day,timeSlot,subject,facultyEmail,classroom,isLab]
 *   - JSON body: { data: [...] }
 */
export const uploadTimetable = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const filePath = req.file.path;

    // Convert CSV → JSON
    const jsonArray = await csv().fromFile(filePath);

    if (!jsonArray.length) return res.status(400).json({ message: "Empty CSV file." });

    // Normalize and validate data
    const formatted = jsonArray.map((row) => ({
      section: row.Section?.trim(),
      day: row.Day?.trim(),
      time: row.Time?.trim(),
      subject: row.Subject?.trim(),
      faculty: row.Faculty?.trim(),
      type: row.Type?.trim()?.toLowerCase() || "theory",
    }));

    // Save to MongoDB
    await Timetable.insertMany(formatted);

    // Remove uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `✅ Timetable uploaded successfully (${formatted.length} entries).`,
    });
  } catch (err) {
    console.error("❌ Error uploading timetable:", err);
    res.status(500).json({ message: "Server error while uploading timetable." });
  }
};