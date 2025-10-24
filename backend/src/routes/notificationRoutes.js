// backend/routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  sendNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications for a branch/semester/section
router.get("/:branch/:semester/:section", getNotifications);

// Send a new notification (faculty/admin use)
router.post("/", sendNotification);

export default router;
