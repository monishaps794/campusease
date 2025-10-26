// campusease-mobile/src/screens/MyBookingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl } from "react-native";
import api from "../api";

export default function MyBookingsScreen({ route, navigation }) {
  const email = route?.params?.email || "faculty@example.com";
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const data = await api.getMyBookings(email);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    Alert.alert("Confirm", "Cancel this booking request?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const res = await api.cancelBooking(id);
            Alert.alert("Cancelled", res.message || "Booking cancelled");
            load();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to cancel");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>My Booking Requests</Text>

      {!bookings.length && <Text>No bookings found.</Text>}

      {bookings.map((b) => (
        <View
          key={b._id}
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            borderLeftWidth: 6,
            borderLeftColor: b.status === "approved" ? "green" : b.status === "rejected" ? "red" : "orange",
          }}
        >
          <Text style={{ fontWeight: "600" }}>{b.roomNumber || b.roomId?.roomNumber || b.roomId}</Text>
          <Text>Date: {b.date}</Text>
          <Text>Slot: {b.slot}</Text>
          <Text>Status: {b.status}</Text>
          {b.reason && <Text>Reason: {b.reason}</Text>}

          {b.status === "pending" && (
            <TouchableOpacity onPress={() => cancel(b._id)} style={{ marginTop: 8, backgroundColor: "#e63946", padding: 8, borderRadius: 6 }}>
              <Text style={{ color: "#fff", textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
