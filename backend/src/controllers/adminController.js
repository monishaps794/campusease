// backend/src/controllers/adminController.js
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";

// ✅ Get admin profile by email
export const getAdminProfile = async (req, res) => {
  try {
    const email = req.query.email;
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// ✅ Create a new faculty account (used by Admin)
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, department, designation } = req.body;
    if (!name || !email || !password || !department || !designation)
      return res.status(400).json({ message: "All fields are required." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Faculty already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFaculty = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "faculty",
      department,
      designation,
    });

    res.status(201).json({
      success: true,
      message: "Faculty created successfully.",
      user: newFaculty,
    });
  } catch (error) {
    console.error("❌ Error creating faculty:", error);
    res.status(500).json({ message: "Server error while creating faculty." });
  }
};

// ✅ Get all users (Admin view)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};

// ✅ Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found." });

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user." });
  }
};

// ✅ Get all bookings (Admin view)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user classroom");
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ message: "Server error while fetching bookings." });
  }
};

// ✅ Approve booking
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    res.status(200).json({
      success: true,
      message: "Booking approved successfully.",
      booking,
    });
  } catch (error) {
    console.error("❌ Error approving booking:", error);
    res.status(500).json({ message: "Server error while approving booking." });
  }
};

// ✅ Reject booking
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ message: "Booking not found." });

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully.",
      booking,
    });
  } catch (error) {
    console.error("❌ Error rejecting booking:", error);
    res.status(500).json({ message: "Server error while rejecting booking." });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Booking.find({ status: "pending" });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("getPendingRequests error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
