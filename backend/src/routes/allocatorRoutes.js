// backend/src/routes/allocationRoutes.js
import express from "express";
import { autoAllocate } from "../controllers/allocatorController.js";

const router = express.Router();
router.get("/auto", autoAllocate);

export default router;
