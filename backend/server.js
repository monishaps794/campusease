/*import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

// ✅ Correct imports — match your actual filenames
import authRoutes from "./src/routes/auth.js";
import facultyRoutes from "./src/routes/faculty.js";
import commonRoutes from "./src/routes/common.js";
import adminRoutes from "./src/routes/admin.js";
import studentRoutes from "./src/routes/student.js";
import staffRoutes from "./src/routes/staff.js";
import timetableRoutes from "./src/routes/timetable.js";
import notificationRoutes from "./src/routes/notification.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// ✅ Attach routes
app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/common", commonRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/timetable", timetableRoutes);
app.use("/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));*/

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

// ✅ Import route files
import authRoutes from "./src/routes/auth.js";
import facultyRoutes from "./src/routes/faculty.js";
import commonRoutes from "./src/routes/common.js";
import adminRoutes from "./src/routes/admin.js";
import studentRoutes from "./src/routes/student.js";
import staffRoutes from "./src/routes/staff.js";
import timetableRoutes from "./src/routes/timetable.js";
import notificationRoutes from "./src/routes/notification.js";

// ✅ Initialize environment variables and DB connection
dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:19006", // Expo Local Dev
      "http://172.16.12.53:19006", // Your LAN IP (if using same network mobile testing)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Default route for testing
app.get("/", (req, res) => {
  res.send("🚀 CampusEase backend is running...");
});

// ✅ Attach all routes
app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/common", commonRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/timetable", timetableRoutes);
app.use("/notifications", notificationRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on http://172.16.12.53:${PORT}`)
);
