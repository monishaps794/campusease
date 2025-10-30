// src/routes/allocatorRoutes.js
import express from "express";
import { runAllocatorController,saveAllocationController } from "../controllers/allocatorController.js";

const router = express.Router();

// POST or GET both supported for testing
router.post("/run", runAllocatorController);
router.get("/run", runAllocatorController);
router.post("/save", saveAllocationController);

export default router;
