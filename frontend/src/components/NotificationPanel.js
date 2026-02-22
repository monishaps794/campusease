// src/components/NotificationPanel.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationPanel() {
  const { notifications } = useNotifications();

  if (!notifications.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.noteCard}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  noteCard: {
    backgroundColor: "#007bff22",
    borderRadius: 10,
    marginVertical: 6,
    padding: 12,
  },
  title: { fontWeight: "700", color: "#007bff" },
  message: { color: "#333", marginVertical: 4 },
  time: { fontSize: 12, color: "#666" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666", fontStyle: "italic" },
});
