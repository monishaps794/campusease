/*// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
connectDB();
import "./src/models/index.js";

const app = express();

// ✅ CORS configuration — allows Expo (mobile/web) & local browser access
app.use(
  cors({
    origin: [
      "http://localhost:19006", // Expo web
      "http://127.0.0.1:19006",
      "http://localhost:8081",  // Metro bundler (React Native)
      "http://127.0.0.1:8081",
      "http://10.242.24.77:8081", // Your LAN IP (keep if needed)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Simple test route
app.get("/", (req, res) => res.send("🚀 CampusEase backend running"));

// ✅ Import all routes
import authRoutes from "./src/routes/auth.js";
import facultyRoutes from "./src/routes/faculty.js";
import commonRoutes from "./src/routes/common.js";
import adminRoutes from "./src/routes/admin.js";
import studentRoutes from "./src/routes/student.js";
import staffRoutes from "./src/routes/staff.js";
import timetableRoutes from "./src/routes/timetable.js";
import notificationRoutes from "./src/routes/notification.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import userRoutes from "./src/routes/user.js";
import allocatorRoutes from "./src/routes/allocatorRoutes.js";
import classroomRoutes from "./src/routes/classroomRoutes.js";

// ✅ Mount all route groups
app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/common", commonRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/timetable", timetableRoutes);
app.use("/notifications", notificationRoutes);
app.use("/bookings", bookingRoutes);
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);
app.use("/allocator", allocatorRoutes);
app.use("/classrooms", classroomRoutes);

// ✅ Handle undefined routes (helps debugging)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ✅ Start the server safely on both localhost and LAN
const PORT = process.env.PORT || 5000;
app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err.message);
  });*/

// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
connectDB();
import "./src/models/index.js";

const app = express();

// ✅ CORS configuration — allow all needed frontend origins
app.use(
  cors({
    origin: [
      "http://localhost:8082", // ✅ Your web frontend
      "http://127.0.0.1:8082",

      "http://localhost:19006", // Expo web
      "http://127.0.0.1:19006",

      "http://localhost:8081", // Metro bundler (React Native)
      "http://127.0.0.1:8081",

      "http://10.242.24.77:8081", // Your LAN IP (keep if needed)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Simple test route
app.get("/", (req, res) => res.send("🚀 CampusEase backend running"));

// ✅ Import all routes
import authRoutes from "./src/routes/auth.js";
import facultyRoutes from "./src/routes/faculty.js";
import commonRoutes from "./src/routes/common.js";
import adminRoutes from "./src/routes/admin.js";
import studentRoutes from "./src/routes/student.js";
import staffRoutes from "./src/routes/staff.js";
import timetableRoutes from "./src/routes/timetable.js";
import notificationRoutes from "./src/routes/notification.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import userRoutes from "./src/routes/user.js";
import allocatorRoutes from "./src/routes/allocatorRoutes.js";
import classroomRoutes from "./src/routes/classroomRoutes.js";

// ✅ Mount all route groups
app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/common", commonRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/timetable", timetableRoutes);
app.use("/notifications", notificationRoutes);
app.use("/bookings", bookingRoutes);
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);
app.use("/allocator", allocatorRoutes);
app.use("/classrooms", classroomRoutes);

// ✅ Handle undefined routes (helps debugging)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ✅ Start the server safely on both localhost and LAN
const PORT = process.env.PORT || 5000;
app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("❌ Server failed to start:", err.message);
  });
