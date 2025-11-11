// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";

// Routes
import authRoutes from "./src/routes/auth.js";
import facultyRoutes from "./src/routes/faculty.js";
import adminRoutes from "./src/routes/admin.js";
import studentRoutes from "./src/routes/student.js";
import staffroomRoutes from "./src/routes/staffrooms.js";
import timetableRoutes from "./src/routes/timetable.js";
import notificationRoutes from "./src/routes/notification.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import userRoutes from "./src/routes/user.js";
import allocatorRoutes from "./src/routes/allocatorRoutes.js";
import classroomRoutes from "./src/routes/classroomRoutes.js";
import debugRoutes from "./src/routes/debug.js";

dotenv.config();
connectDB();
import "./src/models/index.js";

const app = express();

// ✅ Create HTTP server wrapper (required for socket.io)
const server = createServer(app);

// ✅ Attach Socket.io (exported for models/controllers)
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:19006",
      "http://127.0.0.1:19006",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "http://10.183.195.64:8081",
      "*",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// (Optional) track who connected (can be useful later)
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  // Client can send a profile to register (email/role/section)
  socket.on("register", (profile) => {
    connectedUsers.set(socket.id, profile || {});
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    console.log("❌ User disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: [
      "http://localhost:19006",
      "http://127.0.0.1:19006",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "http://10.183.195.64:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("🚀 CampusEase backend running"));

// Mount routes
app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/staffrooms", staffroomRoutes);
app.use("/timetable", timetableRoutes);
app.use("/notifications", notificationRoutes);
app.use("/bookings", bookingRoutes);
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);
app.use("/allocator", allocatorRoutes);
app.use("/classrooms", classroomRoutes);
app.use("/debug", debugRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
