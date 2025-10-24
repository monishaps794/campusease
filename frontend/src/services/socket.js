import { io } from "socket.io-client";
import { BASE_URL } from "../constants/config";
import { sendLocalNotification } from "./notification";

const SOCKET_URL = "ws://192.168.0.103:4000";


let socket = null;

export function connectSocket(token, onNotification) {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
  socket.on("disconnect", (reason) => console.log("⚠️ Socket disconnected:", reason));
  socket.on("connect_error", (err) => console.warn("❌ Socket connection error:", err.message));

  socket.on("booking_created", (data) => {
    console.log("📘 New booking created:", data);
    sendLocalNotification("New Booking Request", `${data?.userName || "Faculty"} booked ${data?.roomName || "a room"}`);
    if (onNotification) onNotification(data);
  });

  socket.on("booking_status_updated", (data) => {
    console.log("📗 Booking status updated:", data);
    sendLocalNotification("Booking Status Updated", `Your booking for ${data?.roomName} is now ${data?.status}`);
    if (onNotification) onNotification(data);
  });

  socket.on("notification", (notif) => {
    console.log("🔔 Notification received:", notif);
    sendLocalNotification(notif.title || "Update", notif.body || "New notification");
    if (onNotification) onNotification(notif);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
}
