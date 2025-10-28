// frontend/src/screens/StaffroomScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";

export default function StaffroomScreen() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example static mock (later connect to `/faculty/availability`)
    setTimeout(() => {
      setFaculty([
        { id: 1, name: "Prof. Harsha BR", subject: "Operating Systems", available: "Yes" },
        { id: 2, name: "Dr. Bharath Goudar", subject: "Discrete Math", available: "No" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Staffroom - Faculty Availability</Text>
      <FlatList
        data={faculty}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={[styles.status, { color: item.available === "Yes" ? "green" : "red" }]}>
              {item.available === "Yes" ? "Available" : "Busy"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#222" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
  subject: { fontSize: 14, color: "#333" },
  status: { fontSize: 14, marginTop: 4, fontWeight: "600" },
});
