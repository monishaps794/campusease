import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

const toBranch = (dept) => {
  if (!dept) return "";
  const x = String(dept).trim().toUpperCase();
  if (x.includes("INFORMATION")) return "Information Science"; // backend accepts both
  return dept;
};

export default function StudentBookingsScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (!u) {
          setLoading(false);
          return;
        }

        const branch = toBranch(u.branch || u.department || "");
        const year = String(u.year || "").replace(/\D/g, "");
        const section = String(u.section || "").toUpperCase().replace(/^\d+/, ""); // "A"

        const res = await api.getSectionBookings({ branch, year, section });
        if (res?.success) setList(res.bookings || []);
        else Alert.alert("Error", res?.message || "Failed to load bookings");
      } catch (e) {
        console.log("StudentBookings load error:", e);
        Alert.alert("Error", e?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 120 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classroom Bookings for Your Section</Text>
      <FlatList
        data={list}
        keyExtractor={(i, idx) => i._id || String(idx)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.room}>{item.roomNumber || item?.roomId?.roomNumber || "-"}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Slot: {item.slot}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Booked By: {item.facultyName || item.requestedBy || "-"}</Text>
            <Text>Reason: {item.reason || "-"}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No bookings.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  card: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10, backgroundColor: "#fafafa" },
  room: { fontSize: 16, fontWeight: "bold" },
});
