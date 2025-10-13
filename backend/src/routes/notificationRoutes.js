import express from "express";
import { listNotifications, createNotification } from "../controllers/notificationController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all notifications
router.get("/", auth, listNotifications);

// Create a new notification
router.post("/", auth, createNotification);

export default router;
