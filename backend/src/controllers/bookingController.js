import Booking from "../models/Booking.js";

// ✅ Create a new booking request
export const createBooking = async (req, res) => {
  try {
    const { roomId, branch, year, section, reason } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!roomId || !branch || !year || !section || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBooking = new Booking({
      userId,
      facultyId: userId, // ✅ store who made the booking
      roomId,
      branch,
      year,
      section,
      reason,
      status: "pending",
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error("❌ Booking creation error:", err);
    res.status(500).json({ message: "Failed to create booking request" });
  }
};

// ✅ Get all bookings for a specific faculty (My Bookings)
export const getFacultyBookings = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const bookings = await Booking.find({ facultyId })
      .populate("roomId", "name type capacity")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("❌ Error fetching faculty bookings:", err);
    res.status(500).json({ message: "Error fetching faculty bookings" });
  }
};

// ✅ Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting booking:", err);
    res.status(500).json({ message: "Error deleting booking" });
  }
};
