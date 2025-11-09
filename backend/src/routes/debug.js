import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

router.get("/timetable-raw", async (req, res) => {
  const all = await Timetable.find().limit(20);
  res.json(all);
});

export default router;
