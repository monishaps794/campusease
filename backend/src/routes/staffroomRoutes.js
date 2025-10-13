import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { listStaffrooms } from "../controllers/staffroomController.js";
import Staffroom from "../models/Staffroom.js";

const router = express.Router();

// 🧾 Get all staffrooms and faculty presence
router.get("/", auth, listStaffrooms);

// ✏️ TEMP: Add new staffroom (for setup)
router.post("/", auth, async (req, res) => {
  const { name, facultyIds } = req.body;
  const room = await Staffroom.create({ name, facultyIds });
  res.status(201).json(room);
});

export default router;
