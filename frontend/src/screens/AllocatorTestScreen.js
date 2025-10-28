import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import api from "../api";

export default function AutoAllocatorScreen() {
  const [allocations, setAllocations] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAutoAllocator = async () => {
    try {
      setLoading(true);
      const result = await api.post("/allocator/auto", {});
      if (result.success) setAllocations(result.allocations);
    } catch (err) {
      console.error("auto allocate error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auto Classroom Allocation</Text>
      <TouchableOpacity style={styles.btn} onPress={runAutoAllocator}>
        <Text style={styles.btnText}>Run Auto Allocator</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}

      {allocations && (
        <FlatList
          data={Object.entries(allocations)}
          keyExtractor={([key]) => key}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.section}>{item[0]}</Text>
              <Text style={styles.room}>Room: {item[1]}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  btn: { backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginVertical: 6 },
  section: { fontWeight: "bold", fontSize: 16 },
  room: { color: "#007AFF" },
});
