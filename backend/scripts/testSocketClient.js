// backend/scripts/testSocketClient.js
import { io } from "socket.io-client";
import chalk from "chalk";

// Adjust this if you're testing over LAN / different host
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

console.log(chalk.cyan(`🔌 Connecting to Socket.IO server at ${SOCKET_URL} ...`));

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // prefer websocket; socket.io will fall back if needed
  reconnection: true,
  reconnectionAttempts: 10,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log(chalk.greenBright(`✅ Connected to server as ${socket.id}`));

  // Optional: register a fake profile so server's connectedUsers map has something
  socket.emit("register", {
    email: "debug@campusease.local",
    role: "admin",
    section: "7C",
  });
});

socket.on("disconnect", (reason) => {
  console.log(chalk.redBright("❌ Disconnected from socket server. Reason:"), reason);
});

socket.on("connect_error", (err) => {
  console.log(chalk.redBright("⚠️ Socket connect_error:"), err?.message || err);
});

// 🔸 Allocator Run event
socket.on("allocator:update", (data) => {
  console.log(chalk.blueBright("\n📢 Allocator RUN event received:"));
  console.log(chalk.yellowBright(JSON.stringify(data, null, 2)));
});

// 🔸 Allocator Restore event
socket.on("allocator:restore", (data) => {
  console.log(chalk.magentaBright("\n📢 Allocator RESTORE event received:"));
  console.log(chalk.yellowBright(JSON.stringify(data, null, 2)));
});

// 🔸 Pointer Reset event
socket.on("allocator:reset", (data) => {
  console.log(chalk.redBright("\n🔄 Allocator RESET event received:"));
  console.log(chalk.yellowBright(JSON.stringify(data, null, 2)));
});

// 🔸 Any other events (debug fallback)
socket.onAny((event, data) => {
  if (event.startsWith("allocator:")) return; // already handled above
  console.log(chalk.gray(`\n⚙️ Other event: ${event}`));
  if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
});
