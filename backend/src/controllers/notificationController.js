// src/controllers/notificationController.js
import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const { title, body, to = [], meta = {} } = req.body;
  if (!title || !body) return res.status(400).json({ message: "title and body required" });

  const notif = await Notification.create({ title, body, to, meta });
  const io = req.app.get("io");
  if (io) io.emit("notification", notif);

  res.status(201).json({ notif, message: "Notification sent" });
});

// optionally: list notifications for user
export const listNotifications = asyncHandler(async (req, res) => {
  const user = req.user;
  const filter = {};
  if (user) filter.to = { $in: [user._id] };
  const notifs = await Notification.find(filter).sort({ createdAt: -1 }).lean();
  res.json(notifs);
});
