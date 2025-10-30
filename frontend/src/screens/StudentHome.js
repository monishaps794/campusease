import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LogoutButton from "../components/LogoutButton";

export default function StudentHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Dashboard</Text>

      {/* View Timetable Button */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Timetable")}
      >
        <Text style={styles.cardText}>View Timetable</Text>
      </TouchableOpacity>

      {/* Logout */}
      <View style={{ marginTop: 40 }}>
        <LogoutButton navigation={navigation} />
      </View>
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
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 14,
    marginVertical: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
});
