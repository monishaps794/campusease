// frontend/src/screens/MyBookingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

export default function MyBookingsScreen() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setMe(u);
      await load(u?.email);
    })();
  }, []);

  const load = async (email) => {
    if (!email) return;
    try {
      setLoading(true);
      const r = await api.getBookingsByFaculty(email);
      setList(r?.bookings || []);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id) => {
    try {
      await api.cancelBooking(id);
      Alert.alert("Cancelled", "Your booking/request has been cancelled.");
      await load(me?.email);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to cancel");
    }
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading your bookings…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>📋 My Bookings</Text>
      {!list.length && <Text style={{ color:"#6b7280" }}>No requests/bookings yet.</Text>}
      {list.map((b) => (
        <View key={b._id} style={styles.card}>
          <Text style={styles.room}>Room: {b.roomNumber || b?.roomId?.roomNumber || "-"}</Text>
          <Text>Date: {b.date}</Text>
          <Text>Slot: {b.slot}</Text>
          <Text>Section: {b.section || "-"}</Text>
          <Text>Status: {b.status}</Text>
          {!!b.reason && <Text>Reason: {b.reason}</Text>}
          <View style={{ flexDirection:"row", gap:8, marginTop:8 }}>
            {(b.status === "pending" || b.status === "approved") && (
              <TouchableOpacity style={[styles.smallBtn, { backgroundColor:"#DC2626" }]} onPress={() => cancel(b._id)}>
                <Text style={styles.smallBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f8f9fa", paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff", marginBottom: 10 },
  room: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  smallBtnText: { color: "#fff", fontWeight: "700" },
});
