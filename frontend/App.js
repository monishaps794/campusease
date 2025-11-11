// frontend/App.js
import "react-native-gesture-handler";
import "react-native-reanimated";
import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { io } from "socket.io-client";   // ✅ FIXED IMPORT
import AuthNavigator from "./src/navigation/AuthNavigator";
import { getAuthData } from "./src/utils/storage";

const SOCKET_URL = "http://10.183.195.64:5000";

export default function App() {
  useEffect(() => {
    // ✅ Create socket connection once
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

        // ✅ register client identity (no backend breakage)
        socket.emit("register", {
          email: user.email,
          role: user.role,
          department: user.department || user.branch,
          year: user.year,
          section: user.section,
          platform: Platform.OS,
        });
      } catch {}
    });

    // ✅ SHOW POPUP REAL-TIME
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
