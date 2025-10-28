// frontend/src/utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@campusease_user";
const TOKEN_KEY = "@campusease_token";

/**
 * Save both user and token after login (OTP verified)
 * @param {Object} user
 * @param {string} token
 */
export const saveAuthData = async (user, token) => {
  try {
    if (user != null) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token != null) await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error("saveAuthData error:", err);
  }
};

export const getAuthData = async () => {
  try {
    const u = await AsyncStorage.getItem(USER_KEY);
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return { user: u ? JSON.parse(u) : null, token: t || null };
  } catch (err) {
    console.error("getAuthData error:", err);
    return { user: null, token: null };
  }
};

export const getUser = async () => {
  try {
    const u = await AsyncStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch (err) {
    console.error("getUser error:", err);
    return null;
  }
};

export const getToken = async () => {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t || null;
  } catch (err) {
    console.error("getToken error:", err);
    return null;
  }
};

export const removeAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
  } catch (err) {
    console.error("removeAuthData error:", err);
  }
};
