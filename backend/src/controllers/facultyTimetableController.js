// backend/src/controllers/facultyTimetableController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to your CSV (as you said)
const CSV_PATH = path.resolve(__dirname, "../../scripts/timetable.csv");

// Simple in-memory cache to avoid re-reading on every request
let cache = {
  mtimeMs: 0,
  rows: [],
};

const normalize = (s) => (s ? String(s).trim() : "");

/**
 * Load and parse the CSV if it changed.
 * Expected headers: SECTIONS,DAY,TIME,SUBJECT,FACULTY,TYPE
 */
async function loadCSV() {
  const stat = fs.statSync(CSV_PATH);
  if (stat.mtimeMs === cache.mtimeMs && cache.rows.length) return cache.rows;

  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const rows = records.map((r) => ({
    section: normalize(r.SECTIONS || r.Section || r.SECTION),
    day: normalize(r.DAY),
    time: normalize(r.TIME),
    subject: normalize(r.SUBJECT),
    faculty: normalize(r.FACULTY),
    type: normalize(r.TYPE),
  }));

  cache = { mtimeMs: stat.mtimeMs, rows };
  return rows;
}

/**
 * GET /timetable/faculty/:facultyName
 * Matches case-insensitively on FACULTY column and returns rows for that faculty.
 */
export const getFacultyTimetable = async (req, res) => {
  try {
    const facultyName = normalize(req.params.facultyName);
    if (!facultyName) {
      return res.status(400).json({ success: false, message: "facultyName required" });
    }

    const rows = await loadCSV();
    // Case-insensitive match; also tolerate multiple spaces/punctuation
    const target = facultyName.replace(/\s+/g, " ").toUpperCase();
    const mine = rows.filter((r) => (r.faculty || "").replace(/\s+/g, " ").toUpperCase() === target);

    return res.json({ success: true, timetable: mine });
  } catch (err) {
    console.error("getFacultyTimetable error:", err);
    return res.status(500).json({ success: false, message: "Server error reading faculty timetable" });
  }
};
