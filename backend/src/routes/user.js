import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ✅ Fetch user by email
router.get("/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("❌ Fetch user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
