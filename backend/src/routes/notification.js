import express from "express";
import Notification from "../models/notification.js";

const router = express.Router();

/**
 * Health-check (kept)
 */
router.get("/", (_req, res) => {
  res.json({ message: "Notification route working!" });
});

/**
 * Student notifications (by section)
 * GET /notifications/student?department=Information%20Science&year=3§ion=A
 */
router.get("/student", async (req, res) => {
  try {
    const department = (req.query.department || req.query.branch || "").toString();
    const year = (req.query.year || "").toString();
    const section = (req.query.section || "").toString().toUpperCase();

    if (!department || !year || !section) {
      return res.status(400).json({ success: false, message: "department, year, section required" });
    }

    const items = await Notification.find({
      scope: "student-section",
      department,
      year,
      section,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, notifications: items });
  } catch (e) {
    console.error("GET /notifications/student:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Faculty notifications
 * GET /notifications/faculty/:email
 */
router.get("/faculty/:email", async (req, res) => {
  try {
    const email = (req.params.email || "").toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: "email required" });

    const items = await Notification.find({
      scope: "faculty",
      facultyEmail: email,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, notifications: items });
  } catch (e) {
    console.error("GET /notifications/faculty:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Admin notifications (new requests etc.)
 * GET /notifications/admin
 */
router.get("/admin", async (_req, res) => {
  try {
    const items = await Notification.find({ scope: "admin" })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, notifications: items });
  } catch (e) {
    console.error("GET /notifications/admin:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
