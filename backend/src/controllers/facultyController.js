// src/controllers/facultyController.js
import asyncHandler from "express-async-handler";
import FacultyAvailability from "../models/FacultyAvailability.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import TimetableEntry from "../models/TimetableEntry.js";

/**
 * @desc Faculty updates their daily availability (present, in class, unavailable, absent)
 * @route POST /api/faculty/availability
 * @access Private (Faculty only)
 */
export const updateAvailability = asyncHandler(async (req, res) => {
  const user = req.user;

  // ✅ Ensure only faculty can update availability
  if (!user || user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied. Faculty only." });
  }

  // ✅ Extract fields and default the date
  const { status, date } = req.body;
  const today = new Date().toISOString().split("T")[0];
  const useDate = date || today;

  // ✅ Validate status field
  const validStatuses = ["present", "in class", "unavailable", "absent"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Availability status is required and must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // ✅ Update or create availability record
  const updated = await FacultyAvailability.findOneAndUpdate(
    { facultyId: user._id, date: useDate },
    { status, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // ✅ Create a notification record
  const notif = await Notification.create({
    to: [], // You can add target filters later
    title: "Faculty Availability Updated",
    body: `${user.name} marked as ${status} for ${useDate}`,
    meta: { facultyId: user._id, date: useDate, status },
  });

  // ✅ Emit real-time event if Socket.io is active
  const io = req.app.get("io");
  if (io) io.emit("notification", notif);

  return res.status(200).json({
    message: `Availability updated successfully for ${useDate}`,
    data: updated,
  });
});

/**
 * @desc Get faculty availability (own or others)
 * @route GET /api/faculty/availability
 * @access Private
 */
export const getFacultyAvailability = asyncHandler(async (req, res) => {
  const { facultyId, date } = req.query;
  const user = req.user;

  // Faculty can only view their own availability
  if (user.role === "faculty" && facultyId && facultyId !== user._id.toString()) {
    return res.status(403).json({
      message: "Not authorized to view other faculty availability.",
    });
  }

  const filter = {};
  if (facultyId) filter.facultyId = facultyId;
  if (date) filter.date = date;

  const records = await FacultyAvailability.find(filter)
    .populate("facultyId", "name email role")
    .sort({ date: 1 })
    .lean();

  return res.status(200).json(records);
});

/**
 * @desc Get staffroom-wise faculty availability
 * @route GET /api/faculty/staffroom-status
 * @access Private (Admin/Faculty)
 */
export const getStaffroomStatus = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split("T")[0];

  // Fetch all faculty
  const facultyList = await User.find({ role: "faculty" }).select(
    "name email staffroomId"
  );

  const availabilities = await FacultyAvailability.find({ date: targetDate })
    .select("facultyId status")
    .lean();

  const combined = facultyList.map((fac) => {
    const availability = availabilities.find(
      (a) => a.facultyId.toString() === fac._id.toString()
    );
    return {
      facultyId: fac._id,
      name: fac.name,
      email: fac.email,
      staffroomId: fac.staffroomId || "Unassigned",
      status: availability ? availability.status : "not-updated",
    };
  });

  return res.status(200).json({
    date: targetDate,
    staffrooms: combined.reduce((acc, curr) => {
      if (!acc[curr.staffroomId]) acc[curr.staffroomId] = [];
      acc[curr.staffroomId].push(curr);
      return acc;
    }, {}),
  });
});

/**
 * @desc Get all faculty for admin dashboard
 * @route GET /api/faculty/all
 * @access Private (Admin)
 */
export const getAllFaculty = asyncHandler(async (req, res) => {
  const faculty = await User.find({ role: "faculty" })
    .select("name email branch department staffroomId role")
    .lean();

  return res.status(200).json(faculty);
});

/**
 * @desc Get a faculty's timetable
 * @route GET /api/faculty/timetable
 * @access Private
 */
export const getFacultyTimetable = asyncHandler(async (req, res) => {
  const { facultyId } = req.query;
  if (!facultyId) {
    return res.status(400).json({ message: "facultyId is required." });
  }

  const entries = await TimetableEntry.find({ facultyId }).lean();
  return res.status(200).json(entries);
});
