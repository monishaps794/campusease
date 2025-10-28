// frontend/src/components/LogoutButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { clearAuthData } from "../utils/storage";

export default function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    await clearAuthData();
    navigation.replace("Login");
  };
  return (
    <TouchableOpacity style={styles.btn} onPress={handleLogout}>
      <Text style={styles.txt}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 8, backgroundColor: "#dc3545", borderRadius: 8, margin: 10 },
  txt: { color: "#fff", fontWeight: "bold" },
});
