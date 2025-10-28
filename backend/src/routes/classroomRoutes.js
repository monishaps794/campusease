// backend/src/routes/classroomRoutes.js
import express from "express";
import { getAllClassrooms, createClassroom, getAvailableClassrooms } from "../controllers/classroomController.js";

const router = express.Router();

router.get("/all", getAllClassrooms);
router.post("/", createClassroom);
router.get("/available", getAvailableClassrooms);

export default router;
