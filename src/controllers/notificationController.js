import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

// 🔔 Get a list of notifications (latest first)
export const listNotifications = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const notifs = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  res.json(notifs);
});

// 📢 Create and broadcast a new notification
export const createNotification = asyncHandler(async (req, res) => {
  const { to = [], title, body, type, meta = {} } = req.body;

  const notif = await Notification.create({
    to,
    title,
    body,
    type,
    meta,
  });

  const io = req.app.get("io");
  if (io) io.emit("notification", notif); // broadcast via socket.io

  res.json(notif);
});
