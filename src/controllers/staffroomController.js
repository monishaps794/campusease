import asyncHandler from "express-async-handler";
import Staffroom from "../models/Staffroom.js";
import User from "../models/User.js";
import FacultyAvailability from "../models/FacultyAvailability.js";

// 🧾 Utility to format today's date as YYYY-MM-DD
const getToday = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// 🏢 Get all staffrooms and faculty presence info
export const listStaffrooms = asyncHandler(async (req, res) => {
  const date = req.query.date || getToday();

  // Fetch all staffrooms with their assigned faculties
  const staffrooms = await Staffroom.find()
    .populate({
      path: "facultyIds",
      select: "name email role", // show minimal info
    })
    .lean();

  // If no staffrooms exist
  if (!staffrooms || staffrooms.length === 0) {
    return res.status(404).json({ message: "No staffrooms found" });
  }

  // Build response array with availability status for each faculty
  const results = await Promise.all(
    staffrooms.map(async (sr) => {
      const facultyIds = sr.facultyIds.map((f) => f._id);

      // Fetch today's availability records for all faculties in this staffroom
      const availabilities = await FacultyAvailability.find({
        facultyId: { $in: facultyIds },
        date,
      })
        .select("facultyId status")
        .lean();

      // Build faculty info with status
      const facultyDetails = sr.facultyIds.map((f) => {
        const status =
          availabilities.find(
            (a) => a.facultyId.toString() === f._id.toString()
          )?.status || "not-updated";
        return {
          id: f._id,
          name: f.name,
          email: f.email,
          status,
        };
      });

      const presentCount = facultyDetails.filter(
        (f) => f.status === "present"
      ).length;
      const absentCount = facultyDetails.filter(
        (f) => f.status === "absent"
      ).length;
      const notAvailableCount = facultyDetails.filter(
        (f) => f.status === "not-available"
      ).length;

      return {
        _id: sr._id,
        name: sr.name,
        location: sr.location || "Not specified",
        totalFaculties: facultyDetails.length,
        presentCount,
        absentCount,
        notAvailableCount,
        faculty: facultyDetails,
      };
    })
  );

  res.status(200).json({
    date,
    staffrooms: results,
  });
});

// 🏫 Assign a faculty to a staffroom (admin-only)
export const assignFacultyToStaffroom = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can assign faculty" });
  }

  const { staffroomId, facultyId } = req.body;

  if (!staffroomId || !facultyId) {
    return res
      .status(400)
      .json({ message: "staffroomId and facultyId are required" });
  }

  const staffroom = await Staffroom.findById(staffroomId);
  if (!staffroom) {
    return res.status(404).json({ message: "Staffroom not found" });
  }

  // Check if faculty already assigned
  if (staffroom.facultyIds.includes(facultyId)) {
    return res
      .status(400)
      .json({ message: "Faculty already assigned to this staffroom" });
  }

  staffroom.facultyIds.push(facultyId);
  await staffroom.save();

  // Also update faculty record for easy lookup
  await User.findByIdAndUpdate(facultyId, { staffroomId });

  res.status(200).json({
    message: "Faculty successfully assigned to staffroom",
    staffroom,
  });
});

// 🚪 Remove a faculty from a staffroom (admin-only)
export const removeFacultyFromStaffroom = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can modify staffrooms" });
  }

  const { staffroomId, facultyId } = req.body;

  if (!staffroomId || !facultyId) {
    return res
      .status(400)
      .json({ message: "staffroomId and facultyId are required" });
  }

  const staffroom = await Staffroom.findById(staffroomId);
  if (!staffroom) {
    return res.status(404).json({ message: "Staffroom not found" });
  }

  staffroom.facultyIds = staffroom.facultyIds.filter(
    (id) => id.toString() !== facultyId
  );
  await staffroom.save();

  // Clear faculty's staffroom assignment
  await User.findByIdAndUpdate(facultyId, { $unset: { staffroomId: "" } });

  res.status(200).json({
    message: "Faculty removed from staffroom",
    staffroom,
  });
});
