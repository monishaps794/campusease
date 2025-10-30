import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import api from "../api";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const facultyEmail = "faculty@college.edu"; // Replace if you use login-based email

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookingsByFaculty(facultyEmail);
      setBookings(res?.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      Alert.alert("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    Alert.alert("Confirm", "Cancel this booking?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const res = await api.cancelBooking(bookingId);
            Alert.alert("Booking cancelled", res.message || "");
            fetchMyBookings();
          } catch (err) {
            console.error("Cancel error:", err);
            Alert.alert("Error cancelling booking");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  return (
    <ScrollView
      style={{ padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchMyBookings} />
      }
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        📋 My Bookings
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : bookings.length === 0 ? (
        <Text>No bookings found</Text>
      ) : (
        bookings.map((b) => (
          <View
            key={b._id}
            style={{
              backgroundColor: "#f8f9fa",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              borderLeftWidth: 5,
              borderLeftColor:
                b.status === "approved"
                  ? "#28a745"
                  : b.status === "rejected"
                  ? "#dc3545"
                  : "#ffc107",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {b.roomNumber} ({b.date})
            </Text>
            <Text>Slot: {b.slot}</Text>
            <Text>Branch: {b.branch}</Text>
            <Text>
              Status:{" "}
              <Text
                style={{
                  color:
                    b.status === "approved"
                      ? "green"
                      : b.status === "rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "600",
                }}
              >
                {b.status.toUpperCase()}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => handleCancel(b._id)}
              style={{
                backgroundColor: "#dc3545",
                marginTop: 10,
                padding: 8,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}
