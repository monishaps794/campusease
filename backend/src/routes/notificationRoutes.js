// ✅ src/routes/notificationRoutes.js
import express from "express";

const router = express.Router();

// ✅ POST /api/notifications/send
router.post("/send", async (req, res) => {
  try {
    const { senderId, branch, year, section, message } = req.body;

    if (!senderId || !branch || !year || !section || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("📢 Notification request received:", req.body);

    // Simulate notification send (replace this with actual logic later)
    res.status(200).json({
      success: true,
      message: `Notification sent to ${branch}-${year}-${section}`,
    });
  } catch (err) {
    console.error("❌ Notification send error:", err);
    res.status(500).json({ message: "Notification send failed" });
  }
});

export default router;
