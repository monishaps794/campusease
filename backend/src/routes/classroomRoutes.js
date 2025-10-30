// src/routes/classroomRoutes.js
import express from "express";
import { getAvailableClassrooms, seedClassrooms, getAllClassrooms } from "../controllers/classroomController.js";

const router = express.Router();

// GET available classrooms for given params
router.get("/available", getAvailableClassrooms); // ?date=YYYY-MM-DD&slot=...&branch=..&year=..&section=..

// POST to seed sample classrooms (admin)
router.post("/seed", seedClassrooms);

// GET all classrooms (admin)
router.get("/all", getAllClassrooms);

export default router;
