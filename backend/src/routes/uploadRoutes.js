// backend/src/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadTimetable,
  uploadClassrooms,
  uploadFaculty,
  addClassroom,
  removeClassroom,
} from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// CSV uploads
router.post("/timetable", upload.single("file"), uploadTimetable);
router.post("/classrooms", upload.single("file"), uploadClassrooms);
router.post("/faculty", upload.single("file"), uploadFaculty);

// JSON add / delete
router.post("/classroom", addClassroom); // JSON body
router.delete("/classroom/:id", removeClassroom);

export default router;
