import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { removeAuthData } from "../utils/storage";

export default function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    await removeAuthData();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
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
