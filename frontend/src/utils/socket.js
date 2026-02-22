// src/utils/socket.js
import { io } from "socket.io-client";

// 🧠 Adjust to your LAN IP if testing on devices
const SOCKET_URL = "http://10.183.195.64:5000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelayMax: 2000,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("⚠️ Socket disconnected");
});
