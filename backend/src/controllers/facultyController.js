import asyncHandler from "express-async-handler";
import FacultyAvailability from "../models/FacultyAvailability.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// 🧑‍🏫 Faculty updates their availability (present, not-available, absent)
export const updateAvailability = asyncHandler(async (req, res) => {
  const user = req.user;

  // Only faculty can update their own availability
  if (user.role !== "faculty") {
    return res
      .status(403)
      .json({ message: "Only faculty can update availability" });
  }

  const { date, status } = req.body; // Expects date in YYYY-MM-DD format
  if (!date || !status) {
    return res.status(400).json({ message: "date and status are required" });
  }

  const validStatuses = ["present", "not-available", "absent"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided" });
  }

  // 🧾 Upsert availability (update existing or create new)
  const updated = await FacultyAvailability.findOneAndUpdate(
    { facultyId: user._id, date },
    { status, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 📢 Create a notification for admin/students
  const notif = await Notification.create({
    to: [], // you can later filter students/faculty by department if needed
    title: "Faculty Availability Updated",
    body: `${user.name} marked as ${status} for ${date}`,
    meta: { facultyId: user._id, date, status },
  });

  // 🔔 Emit socket notification if Socket.io is active
  const io = req.app.get("io");
  if (io) io.emit("notification", notif);

  res.status(200).json({
    message: `Availability updated successfully for ${date}`,
    data: updated,
  });
});

// 📅 Get faculty availability
export const getFacultyAvailability = asyncHandler(async (req, res) => {
  const { facultyId, date, staffroomId } = req.query;
  const user = req.user;

  // 🧑‍💼 Admin can view all; faculty can view only themselves
  if (user.role !== "admin" && !facultyId) {
    return res
      .status(403)
      .json({ message: "Faculty can only view their own availability" });
  }

  const filter = {};
  if (facultyId) filter.facultyId = facultyId;
  if (date) filter.date = date;

  const availabilityRecords = await FacultyAvailability.find(filter)
    .populate("facultyId", "name email role")
    .sort({ date: 1 })
    .lean();

  res.status(200).json(availabilityRecords);
});

// 🏢 Get staffroom-wise faculty status (for Faculty Locator page)
export const getStaffroomStatus = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const filterDate = date || new Date().toISOString().split("T")[0];

  // Fetch all faculty with their availability for that date
  const facultyList = await User.find({ role: "faculty" }).select(
    "name email staffroomId"
  );

  const availabilities = await FacultyAvailability.find({ date: filterDate })
    .select("facultyId status")
    .lean();

  // Combine data
  const response = facultyList.map((fac) => {
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

  res.status(200).json({
    date: filterDate,
    staffrooms: response.reduce((acc, curr) => {
      if (!acc[curr.staffroomId]) acc[curr.staffroomId] = [];
      acc[curr.staffroomId].push(curr);
      return acc;
    }, {}),
  });
});
