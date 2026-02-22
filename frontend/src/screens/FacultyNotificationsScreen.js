// frontend/src/screens/FacultyNotificationsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

export default function FacultyNotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await getUser();
        if (!u || !u.email) {
          setNotifications([]);
          return;
        }

        const email = u.email;
        const res = await api.getFacultyNotifications(email);
        const list = res.notifications || res.data || res || [];
        setNotifications(list);
      } catch (err) {
        console.log("Faculty notifications error:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading notifications…</Text>
      </View>
    );
  }

  if (!notifications.length) {
    return (
      <View style={styles.centered}>
        <Text>No notifications yet for you.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔔 My Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, idx) => item._id || String(idx)}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title || "Notice"}</Text>
            <Text style={styles.message}>{item.message}</Text>
            {item.createdAt && (
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 12 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  message: { fontSize: 14, color: "#374151" },
  time: { fontSize: 12, color: "#6B7280", marginTop: 6 },
});
