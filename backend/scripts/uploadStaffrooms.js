import mongoose from "mongoose";
import csv from "csvtojson";
import Staffroom from "../src/models/Staffroom.js";

const MONGO_URI = "mongodb+srv://sahana1050_db_user:Sahanaa2060@cluster0.xd0dlfw.mongodb.net/?appName=Cluster0"; // adjust if needed

async function run() {
  await mongoose.connect(MONGO_URI);

  const data = await csv().fromFile("./scripts/staffrooms.csv");

  await Staffroom.deleteMany({});

  const formatted = data.map(d => ({
    name: (d["LECTURE NAME"] || d["LECTURE NAME "] || "").trim(),
    room: (d["STAFFROOM NUMBER"] || d["STAFFROOM NUMBER "] || "").trim(),
    block: (d["BLOCK"] || d["BLOCK "] || "").trim(),
  })).filter(x => x.name && x.room && x.block);

  await Staffroom.insertMany(formatted);
  console.log(`✅ Uploaded ${formatted.length} staffroom records.`);
  process.exit();
}

run();
