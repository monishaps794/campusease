// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";

// ✅ Import all routes
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import staffroomRoutes from "./routes/staffroomRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

// ✅ Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Allow all socket connections temporarily
io.use((socket, next) => next());

// ✅ Socket events
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("subscribe", (data) => {
    if (data?.channel) {
      socket.join(data.channel);
      console.log(`✅ Joined channel: ${data.channel}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ✅ Connect MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/staffrooms", staffroomRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Error handler
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export { io };
