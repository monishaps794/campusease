// backend/scripts/importTimetable.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import csvParser from "csv-parser";
import Timetable from "../src/models/Timetable.js";
import connectDB from "../src/config/db.js";

dotenv.config();

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Usage: node scripts/importTimetable.js <csv-file>");
  process.exit(1);
}
const absolutePath = path.resolve(filePath);

const runImport = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Delete existing timetable entries (careful)
    await Timetable.deleteMany({});
    console.log("🧹 Cleared existing timetable documents.");

    const rows = [];
    fs.createReadStream(absolutePath)
      .pipe(csvParser())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        console.log(`📘 Loaded ${rows.length} rows from CSV`);

        // Build map keyed by branch_year_section_day
        const timetableMap = {};

        for (const r of rows) {
          const sectionRaw = (r.SECTIONS || r.section || "").toString().trim();
          const dayRaw = (r.DAY || r.day || "").toString().trim();
          const time = (r.TIME || r.time || "").toString().trim();
          const subject = (r.SUBJECT || r.subject || "").toString().trim();
          const faculty = (r.FACULTY || r.faculty || "").toString().trim();
          const typeRaw = (r.TYPE || r.type || "THEORY").toString().trim();

          if (!sectionRaw || !dayRaw || !time || !subject) continue;

          // parse section -> year and section letter if possible: "3A"
          const m = sectionRaw.match(/^(\d)([A-Za-z])$/);
          const year = m ? m[1] : "3";
          const section = m ? m[2].toUpperCase() : sectionRaw;
          const branch = r.BRANCH || r.branch || "ISE";

          const key = `${branch}_${year}_${section}_${dayRaw.toUpperCase()}`;
          if (!timetableMap[key]) timetableMap[key] = { branch, year, section, day: dayRaw, slots: [] };

          const slotObj = {
            timeSlot: time,
            subjectName: subject,
            facultyName: faculty,
            classroom: (r.CLASSROOM || r.classroom || "").toString().trim() || null,
            type: (typeRaw || "THEORY").toString().trim(), // <-- important: can be ACTIVITY or NO_ROOM
          };

          timetableMap[key].slots.push(slotObj);
        }

        const docs = Object.values(timetableMap);
        if (docs.length) {
          await Timetable.insertMany(docs);
          console.log(`✅ Imported ${docs.length} timetable documents.`);
        } else {
          console.log("⚠️ No timetable documents to insert (check CSV format).");
        }

        await mongoose.disconnect();
        console.log("🟢 Disconnected from MongoDB.");
      });
  } catch (err) {
    console.error("❌ Import error:", err);
    mongoose.disconnect();
  }
};

runImport();
