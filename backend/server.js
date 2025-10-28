// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";


// routes (ensure files exist)
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

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:19006",
      "http://192.168.31.180:19006",
      "http://localhost:8081",       // ✅ Added for web version
      "http://192.168.31.180:8081",  // ✅ Added for LAN access
      // add your frontend origin(s)
    ],
     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("🚀 CampusEase backend running"));

// mount routes
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, "192.168.31.180", () => {
  console.log(`✅ Server running on http://192.168.31.180:${PORT}`);
});
