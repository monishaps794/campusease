// backend/src/controllers/studentTimetableController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV at: C:\Users\MR\campusease\backend\scripts\timetable.csv
const CSV_PATH = path.resolve(__dirname, "../../scripts/timetable.csv");

// Simple cache
let cache = { mtimeMs: 0, rows: [] };
const norm = (s) => (s ? String(s).trim() : "");

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
    section: norm(r.SECTIONS || r.Section || r.SECTION),
    day: norm(r.DAY),
    time: norm(r.TIME),
    subject: norm(r.SUBJECT),
    faculty: norm(r.FACULTY),
    type: norm(r.TYPE),
  }));

  cache = { mtimeMs: stat.mtimeMs, rows };
  return rows;
}

/**
 * GET /timetable/section/:branch/:year/:section
 * NOTE: `branch` is ignored here (CSV has only section), but we keep it in the URL for consistency.
 * Returns full-week rows for the given section key "3A", "5B", etc.
 */
export const getSectionTimetable = async (req, res) => {
  try {
    const year = String(req.params.year || "").trim();
    const section = String(req.params.section || "").trim().toUpperCase();
    if (!year || !section) {
      return res.status(400).json({ success: false, message: "year and section required" });
    }

    const sectionKey = `${year}${section}`; // e.g., "3A"
    const rows = await loadCSV();

    // Case-insensitive compare
    const mine = rows.filter(
      (r) => (r.section || "").replace(/\s+/g, "").toUpperCase() === sectionKey.toUpperCase()
    );

    return res.json({ success: true, timetable: mine });
  } catch (err) {
    console.error("getSectionTimetable error:", err);
    return res.status(500).json({ success: false, message: "Server error reading section timetable" });
  }
};
