// backend/src/routes/classroomRoutes.js
import express from "express";
import Classroom from "../models/Classroom.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { getAvailableClassrooms } from "../controllers/bookingController.js";

const router = express.Router();

/**
 * IMPORTANT:
 * We now serve availability from bookingController.getAvailableClassrooms,
 * which merges:
 *  - latest AllocationResult (scheduled classes)
 *  - approved bookings at that date+slot
 *  - 7C reserved rooms
 */
router.get("/available", getAvailableClassrooms);

// (Optional) list all classrooms
router.get("/all", async (_req, res) => {
  try {
    const classrooms = await Classroom.find().lean();
    res.json({ success: true, classrooms });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to fetch classrooms" });
  }
});

// (Optional) simple details by roomNumber or Mongo _id
router.get("/details/:idOrNumber", async (req, res) => {
  try {
    const key = req.params.idOrNumber;
    const q = key.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: key }
      : { roomNumber: key };
    const room = await Classroom.findOne(q).lean();
    if (!room) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, room });
  } catch (e) {
    res.status(500).json({ success: false, message: "Failed to fetch details" });
  }
});

// (Optional) seed via admin
router.post("/seed", verifyAdmin, async (_req, res) => {
  try {
    const want = ["ISE101","ISE102","ISE103","ISE104","ISE105","ISE106","ISE107","ISE108","ISELAB1"];
    const existing = await Classroom.find({ roomNumber: { $in: want } }).lean();
    const have = new Set(existing.map(r => r.roomNumber));
    const toInsert = want
      .filter(r => !have.has(r))
      .map(r => ({
        roomNumber: r,
        department: "ISE",
        capacity: r === "ISELAB1" ? 40 : 60,
        type: r === "ISELAB1" ? "LAB" : "Lecture Hall",
      }));
    if (toInsert.length) await Classroom.insertMany(toInsert);
    res.json({ success: true, added: toInsert.map(x => x.roomNumber) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Seed failed" });
  }
});

export default router;
