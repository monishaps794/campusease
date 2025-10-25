import express from "express";
import auth from "../middleware/auth.js";
import * as ctrl from "../controllers/studentController.js";  // 👈 change this

const router = express.Router();

router.post("/select-section", auth, ctrl.selectSection);
router.get("/timetable", auth, ctrl.getTodaysTimetable);

export default router;
