import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LogoutButton from "../components/LogoutButton";

export default function StudentHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Timetable")}>
        <Text style={styles.cardText}>View Timetable</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("MyBookings")}>
        <Text style={styles.cardText}>My Bookings</Text>
      </TouchableOpacity>
      <LogoutButton navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  card: { backgroundColor: "#007AFF", padding: 20, borderRadius: 12, marginVertical: 8, width: "80%" },
  cardText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
});
