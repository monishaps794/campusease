// backend/controllers/notificationController.js
import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

// 📬 GET /api/notifications/:branch/:semester/:section
export const getNotifications = asyncHandler(async (req, res) => {
  const { branch, semester, section } = req.params;
  const notifications = await Notification.find({
    branch,
    semester,
    section,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// 📬 POST /api/notifications
export const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, branch, semester, section, sender } = req.body;

  if (!title || !message || !branch || !semester || !section) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const notification = await Notification.create({
    title,
    message,
    branch,
    semester,
    section,
    sender,
  });

  res.status(201).json({ message: "Notification sent", notification });
});
