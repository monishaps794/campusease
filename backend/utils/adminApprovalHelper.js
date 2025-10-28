// backend/utils/adminApprovalHelper.js
import Booking from "../src/models/Booking.js";
import Classroom from "../src/models/Classroom.js";
import { sendNotificationEmail } from "./mailer.js";

/**
 * Approve booking by ID and notify requester
 */
export async function approveBookingById(id, approvedBy = "admin") {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  const conflict = await Booking.findOne({
    _id: { $ne: booking._id },
    roomId: booking.roomId,
    date: booking.date,
    slot: booking.slot,
    status: "approved",
  });
  if (conflict) throw new Error("Conflict: room already approved for that slot");

  booking.status = "approved";
  booking.approvedBy = approvedBy;
  await booking.save();

  await Classroom.findByIdAndUpdate(booking.roomId, { status: "Booked" });

  try {
    await sendNotificationEmail(
      booking.requestedBy,
      "Booking Approved",
      `Your booking for ${booking.date} (${booking.slot}) has been approved. Room: ${booking.roomId}`
    );
  } catch (e) {
    console.warn("Email failed:", e.message);
  }

  return booking;
}

/**
 * Reject booking by ID and notify requester
 */
export async function rejectBookingById(id) {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  booking.status = "rejected";
  await booking.save();

  try {
    await sendNotificationEmail(
      booking.requestedBy,
      "Booking Rejected",
      `Your booking for ${booking.date} (${booking.slot}) was rejected.`
    );
  } catch (e) {
    console.warn("Email failed:", e.message);
  }

  return booking;
}
