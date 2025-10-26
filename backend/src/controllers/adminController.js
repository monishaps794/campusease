import User from "../models/User.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";

// Create a new faculty account
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFaculty = new User({
      name,
      email,
      password: hashedPassword,
      role: "faculty",
      department,
    });

    await newFaculty.save();
    res.status(201).json({ message: "Faculty created successfully", user: newFaculty });
  } catch (error) {
    console.error("Error creating faculty:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user classroom");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve booking
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking approved successfully", booking });
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject booking
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking rejected successfully", booking });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
