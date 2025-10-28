import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LogoutButton from "../components/LogoutButton";

export default function AdminHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AllBookings")}>
        <Text style={styles.cardText}>View All Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Requests")}>
        <Text style={styles.cardText}>Pending Requests</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AutoAllocator")}>
        <Text style={styles.cardText}>Auto Allocate Classrooms</Text>
      </TouchableOpacity>
      <LogoutButton navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 30 },
  card: { backgroundColor: "#007AFF", padding: 20, borderRadius: 12, marginVertical: 8, width: "80%" },
  cardText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
});
