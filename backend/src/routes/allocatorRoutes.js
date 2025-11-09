// backend/src/routes/allocatorRoutes.js
import express from "express";
import {
  runAllocator,
  restoreDefault,
  saveAllocation,
  getLatestAllocation,
  seedISEClassrooms,
} from "../controllers/allocatorController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/latest", getLatestAllocation);
router.post("/run", verifyAdmin, runAllocator);
router.post("/restore-default", verifyAdmin, restoreDefault);
router.post("/save", verifyAdmin, saveAllocation);
router.post("/seed-classrooms", verifyAdmin, seedISEClassrooms);

export default router;
