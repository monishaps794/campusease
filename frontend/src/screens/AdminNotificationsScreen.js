import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "../api";

export default function AdminNotificationsScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.getAdminNotifications();
      if (res?.success) setList(res.notifications || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 120 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Notifications</Text>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.title}</Text>
            <Text style={styles.info}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign:"center", marginTop: 20 }}>No notifications.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", textAlign:"center", marginBottom: 10 },
  card: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 8 },
  message: { fontSize: 16, fontWeight: "bold" },
  info: { fontSize: 14, marginTop: 4, color:"#444" },
});
