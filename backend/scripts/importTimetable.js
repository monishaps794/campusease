// backend/scripts/importTimetable.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import csvParser from "csv-parser";
import Timetable from "../src/models/Timetable.js";
import Faculty from "../src/models/Faculty.js";
import connectDB from "../src/config/db.js";

dotenv.config();

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Usage: node scripts/importTimetable.js <csv-file>");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);

const runImport = async () => {
  await connectDB();
  console.log("✅ Connected to MongoDB");

  await Timetable.deleteMany({});
  await Faculty.deleteMany({});
  console.log("🧹 Old timetable and faculty data cleared.");

  const rows = [];
  fs.createReadStream(absolutePath)
    .pipe(csvParser())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      console.log(`📘 Loaded ${rows.length} rows from CSV`);

      const timetableMap = {};
      const facultySet = new Map();

      for (const r of rows) {
        const sectionRaw = r.SECTIONS?.trim();
        const day = r.DAY?.trim();
        const timeSlot = r.TIME?.trim();
        const subject = r.SUBJECT?.trim();
        const faculty = r.FACULTY?.trim();
        const type = r.TYPE?.trim() || "THEORY";

        if (!sectionRaw || !day || !timeSlot || !subject) continue;

        // Extract branch/year/section (ex: "3A" => year=3, section=A)
        const match = sectionRaw.match(/^(\d)([A-Z])$/i);
        const year = match ? match[1] : "3";
        const section = match ? match[2].toUpperCase() : sectionRaw;
        const branch = "ISE"; // or detect dynamically later

        const key = `${branch}_${year}_${section}_${day}`;
        if (!timetableMap[key])
          timetableMap[key] = { branch, year, section, day, slots: [] };

        timetableMap[key].slots.push({
          timeSlot,
          subjectName: subject,
          facultyName: faculty,
          type,
        });

        if (faculty) {
          facultySet.set(faculty, {
            name: faculty,
            department: branch,
            email: faculty.replace(/\s+/g, ".").toLowerCase() + "@college.edu",
          });
        }
      }

      const timetableDocs = Object.values(timetableMap);
      let insertedTT = 0;
      let insertedFaculty = 0;

      if (timetableDocs.length) {
        await Timetable.insertMany(timetableDocs);
        insertedTT = timetableDocs.length;
      }

      if (facultySet.size) {
        await Faculty.insertMany([...facultySet.values()]);
        insertedFaculty = facultySet.size;
      }

      console.log(`✅ Imported ${insertedTT} timetable records.`);
      console.log(`✅ Created ${insertedFaculty} faculty records.`);

      await mongoose.disconnect();
      console.log("🟢 Disconnected from MongoDB.");
    });
};

runImport().catch((err) => {
  console.error("❌ Import error:", err);
  mongoose.disconnect();
});
