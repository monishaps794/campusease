// src/context/NotificationContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { socket } from "../utils/socket";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleRun = (data) => {
      addNote("Allocator Run", data.message || "Allocator executed successfully");
    };
    const handleRestore = (data) => {
      addNote("Allocator Restore", data.message || "Default allocation restored");
    };
    const handleReset = (data) => {
      addNote("Allocator Reset", data.message || "Rotation pointer reset");
    };

    socket.on("allocator:update", handleRun);
    socket.on("allocator:restore", handleRestore);
    socket.on("allocator:reset", handleReset);

    return () => {
      socket.off("allocator:update", handleRun);
      socket.off("allocator:restore", handleRestore);
      socket.off("allocator:reset", handleReset);
    };
  }, []);

  const addNote = (title, message) => {
    const newNote = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNote, ...prev]);
    Alert.alert(title, message);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNote }}>
      {children}
    </NotificationContext.Provider>
  );
};
