// src/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadClassrooms,
  uploadFaculty,
  uploadTimetable,
} from "../controllers/uploadController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });
// Upload classrooms
router.post("/classrooms", upload.single("file"), uploadClassrooms);

// Upload faculty list
router.post("/faculty", upload.single("file"), uploadFaculty);

// Upload timetable (Mon–Sat)
router.post("/timetable", upload.single("file"), uploadTimetable);

export default router;
