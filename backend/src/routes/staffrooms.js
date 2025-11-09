import express from "express";
import Staffroom from "../models/Staffroom.js";

const router = express.Router();

// GET all staffrooms
router.get("/all", async (req, res) => {
  try {
    const staffrooms = await Staffroom.find().sort({ room: 1 });
    res.json({ success: true, staffrooms });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
