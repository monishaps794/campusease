// backend/src/socket/socket.js
import { Server } from "socket.io";

let ioInstance = null;

/**
 * Initializes Socket.io server and attaches to the HTTP server.
 * Call this once from server.js after the server starts.
 */
export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*", // For development; restrict later in production
      methods: ["GET", "POST"],
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);

    // Example registration event
    socket.on("register", (data) => {
      console.log("🧍 Registered:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return ioInstance;
};

/**
 * Returns the global io instance.
 * Controllers can import and use `io.emit()` safely.
 */
export const io = {
  emit: (event, payload) => {
    if (!ioInstance) {
      console.warn("⚠️ Socket not initialized yet");
      return;
    }
    ioInstance.emit(event, payload);
  },
};
