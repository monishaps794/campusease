// src/screens/Faculty/FacultyDashboard.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { sendLocalNotification } from "../../services/notification";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState("present");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch faculty bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings/faculty/${user._id}`);
        console.log("✅ Faculty Bookings:", res.data);
        setBookings(res.data || []);
      } catch (err) {
        console.warn("⚠️ Error fetching faculty bookings:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchBookings();
  }, [user]);

  // ✅ Update availability
  const handleAvailability = async (status) => {
    try {
      setAvailability(status);
      await api.post("/faculty/availability", {
        facultyId: user._id,
        status,
      });
      sendLocalNotification("Availability Updated", `You are marked as ${status}`);
      Alert.alert("Updated", `Availability updated to "${status}".`);
    } catch (err) {
      Alert.alert("Error", "Could not update availability.");
    }
  };

  // ✅ Cancel booking
  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      sendLocalNotification("Booking Cancelled", "Your booking request was cancelled.");
      Alert.alert("Cancelled", "Your booking has been cancelled.");
    } catch (err) {
      console.error("❌ Cancel booking failed:", err.message);
      Alert.alert("Error", "Could not cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading Faculty Dashboard...</Text>
      </View>
    );
  }

  // ✅ Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Dashboard</Text>

      {/* Availability section */}
      <Text style={styles.subtitle}>Mark Your Availability</Text>
      <View style={styles.row}>
        {["present", "in class", "unavailable", "absent"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.btn, availability === status && styles.activeBtn]}
            onPress={() => handleAvailability(status)}
          >
            <Text style={styles.btnText}>{status.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings section */}
      <Text style={[styles.subtitle, { marginTop: 25 }]}>Your Booking Requests</Text>
      {bookings.length === 0 ? (
        <Text style={styles.info}>No current bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <Text style={styles.roomName}>{item.roomId?.name || "Room"}</Text>
              <Text>Branch: {item.branch}</Text>
              <Text>Year: {item.year}</Text>
              <Text>Section: {item.section}</Text>
              <Text>Reason: {item.reason}</Text>
              <Text>Status: {item.status}</Text>
              <TouchableOpacity onPress={() => handleCancelBooking(item._id)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8ff", padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#2E86DE", marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  btn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    width: "23%",
    alignItems: "center",
  },
  activeBtn: { backgroundColor: "#2E86DE" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  bookingCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  roomName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cancelText: { color: "red", marginTop: 6, fontWeight: "600" },
  info: { textAlign: "center", color: "#888", marginVertical: 5 },
});
