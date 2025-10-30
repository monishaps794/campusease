// frontend/src/screens/AllBookingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "../api";

export default function AllBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getAllBookings();
      if (res && res.success) setBookings(res.bookings || []);
      else setBookings([]);
    } catch (err) {
      console.error("❌ Fetch all bookings error:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllBookings(); }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.room}>Room: {item.roomId?.roomNumber || (item.roomId?._id || item.roomId)}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Slot: {item.slot}</Text>
            <Text>Requested By: {item.requestedBy}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No bookings available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginVertical: 6, elevation: 2 },
  room: { fontWeight: "bold", color: "#007AFF" },
});
