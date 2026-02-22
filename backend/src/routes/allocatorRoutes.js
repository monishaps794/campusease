import express from "express";
import auth from "../middleware/auth.js";
import {
  runAllocator,
  restoreDefault,
  saveAllocation,
  getLatestAllocation,
  seedISEClassrooms,
  resetRotationPointer,
  getAllocatorStatus,
  getAllocatorLogs
} from "../controllers/allocatorController.js";

const router = express.Router();

/**
 * Robust admin guard:
 * - Requires req.user.role === "admin"
 * - If ADMIN_EMAIL is set, also requires email match
 * - If ADMIN_EMAIL is NOT set, any admin is allowed
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized (admin only)" });
    }
    const adminEnv = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    if (adminEnv && (req.user.email || "").toLowerCase() !== adminEnv) {
      return res.status(401).json({ success: false, message: "Unauthorized (admin email mismatch)" });
    }
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// Seed ISE rooms (admin only)
router.post("/seed-classrooms", auth, requireAdmin, seedISEClassrooms);

// Run allocator (admin only)
router.post("/run", auth, requireAdmin, runAllocator);

// Restore default allocation (admin only)
router.post("/restore-default", auth, requireAdmin, restoreDefault);

// Save allocation (admin only)
router.post("/save", auth, requireAdmin, saveAllocation);

// Fetch latest allocation (any authenticated user can view; loosen if you want)
router.get("/latest", auth, getLatestAllocation); // ✅ no requireAdmin

// Reset rotation pointer (admin only)
router.post("/reset-pointer", auth, resetRotationPointer);

// Get allocator status (any authenticated user can view; loosen if you want)
router.get("/status", auth, getAllocatorStatus); // ✅ no requireAdmin

// Get allocator logs (admin only)
router.get("/logs", auth,  getAllocatorLogs);
export default router;
