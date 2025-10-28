// backend/src/routes/admin.js
import express from "express";
import { getPendingRequests } from "../controllers/bookingController.js";
import { getAllBookings } from "../controllers/bookingController.js";

const router = express.Router();

// Keep any existing admin endpoints here...

// compatibility proxies
router.get("/requests", async (req, res, next) => {
  // delegate to bookingController.getPendingRequests
  return getPendingRequests(req, res, next);
});

router.get("/bookings", async (req, res, next) => {
  return getAllBookings(req, res, next);
});

export default router;
