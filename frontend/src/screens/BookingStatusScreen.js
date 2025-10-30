// frontend/src/screens/BookingStatusScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import api from "../api";
import { getAuthData } from "../utils/storage";

export default function BookingStatusScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { user } = await getAuthData();
      if (user?.email) {
        setEmail(user.email);
        fetchBookings(user.email);
      }
    })();
  }, []);

  const fetchBookings = async (email) => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/faculty/${email}`);
      if (res?.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(email);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.room}>{item.roomNumber || "Classroom"}</Text>
      <Text>Date: {item.date}</Text>
      <Text>Slot: {item.slot}</Text>
      <Text>Branch: {item.branch}</Text>
      <Text>Section: {item.section}</Text>
      <Text style={[styles.status, item.status === "Approved" ? styles.approved : item.status === "Rejected" ? styles.rejected : styles.pending]}>
        {item.status || "Pending"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Booking Requests</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No bookings yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  card: { backgroundColor: "#f7f7f7", padding: 12, borderRadius: 8, marginBottom: 10 },
  room: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  status: { marginTop: 6, fontWeight: "bold", textTransform: "uppercase" },
  approved: { color: "green" },
  rejected: { color: "red" },
  pending: { color: "orange" },
  empty: { textAlign: "center", color: "#666", marginTop: 30 },
});
