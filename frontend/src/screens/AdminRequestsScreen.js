import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { api } from "../api";

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await api("/admin/requests");
      if (data.success) setRequests(data.requests || []);
    } catch (err) {
      console.error("❌ Fetch requests error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDecision = async (id, status) => {
    try {
      await api("/admin/approve", "POST", { bookingId: id, status });
      fetchData();
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Room: {item.roomId}</Text>
            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.text}>Slot: {item.slot}</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => handleDecision(item._id, "approved")} style={[styles.btn, { backgroundColor: "green" }]}>
                <Text style={styles.btnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDecision(item._id, "rejected")} style={[styles.btn, { backgroundColor: "red" }]}>
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginVertical: 6, elevation: 2 },
  text: { fontSize: 15 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  btn: { padding: 10, borderRadius: 8, width: "48%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
});
