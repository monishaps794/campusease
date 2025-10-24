// ✅ src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/config";

// ✅ Fallback to your LAN IP if BASE_URL is not defined
const API_BASE = BASE_URL || "http://192.168.0.103:4000/api";

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach token automatically before every request
api.interceptors.request.use(async (config) => {
  let token = global.user?.token;

  if (!token) {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      token = parsed?.token;
      if (token) {
        global.user = parsed;
      } else {
        console.warn("⚠️ No token inside stored user object");
      }
    } else {
      console.warn("⚠️ No stored user found in AsyncStorage");
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Using token:", token);
  }

  return config;
});


// ✅ Handle API errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message;
    console.warn("🔴 API error:", message);
    return Promise.reject(error);
  }
);

export default api;
