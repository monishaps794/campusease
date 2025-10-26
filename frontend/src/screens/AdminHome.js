// src/screens/AdminHome.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { saveUser } from "../utils/storage";

export default function AdminHome({ navigation }) {
  const handleLogout = async () => {
    await saveUser(null);
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛠 Admin Dashboard</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Requests")}
      >
        <Text style={styles.btnText}>📥 Booking & Leave Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Booking")}
      >
        <Text style={styles.btnText}>🏫 Book Classrooms/Labs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Timetable")}
      >
        <Text style={styles.btnText}>🗓 View Timetable</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Staffroom")}
      >
        <Text style={styles.btnText}>👩‍🏫 Staffrooms & Availability</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("UploadData")}
      >
        <Text style={styles.btnText}>⬆️ Upload Timetable / Faculty Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafc", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 20 },
  btn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
  logout: {
    backgroundColor: "#e63946",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
