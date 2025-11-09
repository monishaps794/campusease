// frontend/src/screens/StudentHome.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LogoutButton from "../components/LogoutButton";

export default function StudentHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>

      {/* View My Section Timetable */}
      <TouchableOpacity
        style={styles.card}
       onPress={() => navigation.navigate("StudentTimetable")}

      >
        <Text style={styles.cardText}>📚 My Timetable</Text>
      </TouchableOpacity>

      {/* Classroom Map - Read Only */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("StudentBookings")}>
      <Text style={styles.cardText}>View Classroom Bookings</Text>
      </TouchableOpacity>
      {/* Staffroom Locations */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Staffrooms")}
      >
        <Text style={styles.cardText}>🏢 Staffroom Locations</Text>
      </TouchableOpacity>

       
      {/* Notifications */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Notifications")}
      >
        <Text style={styles.cardText}>🔔 Notifications</Text>
      </TouchableOpacity>

      

      <LogoutButton navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#0066FF",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginVertical: 10,
    width: "80%",
    elevation: 3,
  },
  cardText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
});
