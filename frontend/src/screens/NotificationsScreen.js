// frontend/src/screens/NotificationsScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example static mock (replace with fetch(`/notifications`))
    setTimeout(() => {
      setNotifications([
        { id: 1, title: "Booking Approved", message: "Your classroom booking has been approved." },
        { id: 2, title: "Timetable Update", message: "Minor update to Section 3A timetable." },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
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
  title: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
  message: { fontSize: 14, color: "#333", marginTop: 4 },
});
