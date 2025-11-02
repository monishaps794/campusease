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
      if (res && (res.success || res.bookings)) {
        setBookings(res.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("❌ Fetch all bookings error:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 All Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.room}>
              Room: {item.roomNumber || item.roomId?.roomNumber || "N/A"}
            </Text>
            <Text>Date: {item.date}</Text>
            <Text>Slot: {item.slot}</Text>
            {item.branch ? <Text>Branch: {item.branch}</Text> : null}
            {item.year ? <Text>Year: {item.year}</Text> : null}
            {item.section ? <Text>Section: {item.section}</Text> : null}
            {item.reason ? <Text>Reason: {item.reason}</Text> : null}
            <Text>Requested By: {item.requestedBy}</Text>
            <Text>Status: {item.status?.toUpperCase()}</Text>
            {item.approvedBy ? <Text>Approved By: {item.approvedBy}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No bookings available.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  room: { fontWeight: "bold", color: "#007bff", fontSize: 16 },
  empty: { textAlign: "center", marginTop: 20, color: "#555" },
});
