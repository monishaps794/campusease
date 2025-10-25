// src/controllers/commonController.js
import Classroom from "../models/Classroom.js";
import Staffroom from "../models/staffroom.js";
import User from "../models/User.js";
import Notification from "../models/notification.js";

// 🧩 Get all classrooms
export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.status(200).json(classrooms);
  } catch (err) {
    console.error("❌ Error fetching classrooms:", err);
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};

// 🧩 Get all staffrooms (alias listStaffrooms)
export const listStaffrooms = async (req, res) => {
  try {
    const staffrooms = await Staffroom.find();
    res.status(200).json(staffrooms);
  } catch (err) {
    console.error("❌ Error fetching staffrooms:", err);
    res.status(500).json({ message: "Failed to fetch staffrooms" });
  }
};

// 🧩 Get all users (for admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude passwords
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// 🧩 Get notifications for a specific user
export const getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user?._id; // comes from auth middleware
    if (!userId) return res.status(400).json({ message: "User not authenticated" });

    const notifications = await Notification.find({
      $or: [{ recipient: userId }, { recipientType: "all" }],
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications for user:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// 🧩 Admin - Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching all notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// 🧩 Create (send) a new notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, recipientType, recipient } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const newNotification = new Notification({
      title,
      message,
      recipientType: recipientType || "all",
      recipient,
    });

    await newNotification.save();
    res.status(201).json({ message: "✅ Notification created", notification: newNotification });
  } catch (err) {
    console.error("❌ Error creating notification:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};
