import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "../api";

export default function StaffroomScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.getStaffrooms();
      if (res?.success) setList(res.staffrooms);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 120 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏢 Staffroom Locations</Text>
      <FlatList
        data={list}
        keyExtractor={(i, index) => index}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.room}>Room: {item.room}</Text>
            <Text style={styles.block}>{item.block}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  title: { fontSize: 20, textAlign: "center", fontWeight: "bold", marginBottom: 12 },
  card: { padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10, borderColor: "#ddd" },
  name: { fontSize: 16, fontWeight: "bold" },
  room: { marginTop: 4, fontSize: 14 },
  block: { fontSize: 14, color: "#555" },
});
