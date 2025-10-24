// ✅ src/server.js
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js"; // ✅ NEW import

dotenv.config();

// ✅ Initialize Express
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
connectDB();

// ✅ Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// ✅ Setup Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for dev
    methods: ["GET", "POST"],
  },
});

// ✅ Make io globally accessible (used in controllers)
app.set("io", io);

// ✅ Socket events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

console.log("🟢 Socket server ready");

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/timetable", timetableRoutes); // ✅ ADDED route

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ CampusEase Backend Running!");
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
