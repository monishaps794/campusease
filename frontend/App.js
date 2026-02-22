// frontend/App.js
import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { io } from "socket.io-client";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { getAuthData } from "./src/utils/storage";

// 👉 Use localhost for now (same machine as backend)
const SOCKET_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "10.94.56.64:5000"; // e.g. http://192.168.1.5:5000 for physical device

export default function App() {
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 2000,
    });

    socket.on("connect", async () => {
      console.log("✅ Socket connected:", socket.id);

      try {
        const auth = await getAuthData();
        const user = auth?.user || {};

        socket.emit("register", {
          email: user.email,
          role: user.role,
          department: user.department || user.branch,
          year: user.year,
          section: user.section,
          platform: Platform.OS,
        });
      } catch (e) {
        console.log("Socket register skipped (no auth yet)");
      }
    });

    socket.on("notification", (note) => {
      if (note?.title && note?.message) {
        Alert.alert(note.title, note.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
