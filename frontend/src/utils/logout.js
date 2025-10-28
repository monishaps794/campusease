// frontend/src/utils/logout.js
import { removeAuthData } from "./storage";

export const handleLogout = async (navigation) => {
  try {
    await removeAuthData();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (err) {
    console.error("❌ Logout error:", err);
  }
};
