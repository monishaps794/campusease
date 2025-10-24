// ✅ src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from AsyncStorage on app start
  useEffect(() => {
  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          global.user = parsed;
          setUser(parsed);
          console.log("✅ Loaded stored user:", parsed);
        } else {
          console.warn("⚠️ No token inside stored user object");
        }
      }
    } catch (err) {
      console.error("Error loading user:", err);
    }
  };
  loadUser();
}, []);


  // ✅ Login
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const loggedInUser = res.data;

      if (!loggedInUser.token) {
        throw new Error("Login response missing token");
      }

      // ✅ Save token + user both in AsyncStorage and global memory
      await AsyncStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      global.user = loggedInUser;

      console.log("✅ Login successful:", loggedInUser);
      return true;
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      return false;
    }
  };

  // ✅ Logout
  const logout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
    global.user = null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
