// frontend/src/utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@campusease_user";

export const saveAuthData = async (user, token) => {
  try {
    const payload = JSON.stringify({ user, token });

    // ✅ Store in AsyncStorage (mobile)
    await AsyncStorage.setItem(USER_KEY, payload);

    // ✅ Store in global memory (fallback)
    global.authToken = token;
    global.authData = payload;

    // ✅ Store in localStorage (web)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem(USER_KEY, payload);
    }

  } catch (err) {
    console.log("saveAuthData error:", err);
  }
};

export const getAuthData = async () => {
  try {
    // ✅ Web: read correct key
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    }

    // ✅ Memory fallback
    if (global.authData) return JSON.parse(global.authData);

    // ✅ Mobile
    const storedMobile = await AsyncStorage.getItem(USER_KEY);
    return storedMobile ? JSON.parse(storedMobile) : null;

  } catch {
    return null;
  }
};

export const getUser = async () => {
  const data = await getAuthData();
  return data?.user || null;
};

export const removeAuthData = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    global.authToken = null;
    global.authData = null;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.log("removeAuthData error:", err);
  }
};
