// frontend/src/screens/AdminHome.js
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LogoutButton from "../components/LogoutButton";
import { useEffect } from "react";
import io from "socket.io-client";

export default function AdminHome() {
  useEffect(() => {
  const socket = io("http://10.183.195.64:5000", { transports: ["websocket"] });

  socket.on("notification", (data) => {
    console.log("🔔 Live Notification:", data);
    // We DO NOT auto navigate, we only refresh notifications screen next time user opens it
  });

  return () => socket.disconnect();
}, []);

  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, backgroundColor: "#f8f9fa" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
        🧭 Admin Dashboard
      </Text>

      <TouchableOpacity onPress={() => navigation.navigate("AdminAllocation")} style={styles.btnGreen}>
        <Text style={styles.btnText}>⚙️ Run Auto Allocator</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("SavedAllocations")} style={styles.btnDark}>
        <Text style={styles.btnText}>📁 View Saved Allocations</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("AdminTimetable")} style={styles.btnBlue}>
        <Text style={styles.btnText}>🗓️ Timetable Matrix View</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("AdminBookClassroom")} style={styles.btnIndigo}>
        <Text style={styles.btnText}>🏫 Admin Direct Booking</Text>
      </TouchableOpacity>
     <TouchableOpacity onPress={() => navigation.navigate("AdminClassroomMap")} style={styles.btnTeal}>
     <Text style={styles.btnText}>🗺️ Classroom Map View</Text>
        </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("AdminRequests")} style={styles.btnPrimary}>
        <Text style={styles.btnText}>📩 Booking Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("AllBookings")} style={styles.btnPurple}>
        <Text style={styles.btnText}>📋 All Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() =>navigation.navigate("Staffrooms")} style={styles.btnOrange}>
      <Text style={styles.btnText}>🏢 Staffroom Locations</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate("AdminNotifications")} style={styles.btnPrimary}>
  <Text style={styles.btnText}>🔔 Notifications</Text>
</TouchableOpacity>

  
      <LogoutButton navigation={navigation} />
    </ScrollView>
  );
}

const styles = {
  btnText: { color: "#fff", textAlign: "center", fontSize: 16 },
  btnGreen: { backgroundColor: "#4CAF50", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnDark: { backgroundColor: "#37474F", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnBlue: { backgroundColor: "#2196F3", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnIndigo: { backgroundColor: "#3f51b5", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnPrimary: { backgroundColor: "#007bff", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnPurple: { backgroundColor: "#9c27b0", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnOrange: { backgroundColor: "#ff9800", padding: 14, borderRadius: 10, marginBottom: 12 },
  btnTeal: { backgroundColor: "#14b8a6", padding: 14, borderRadius: 10, marginBottom: 12 },

};
