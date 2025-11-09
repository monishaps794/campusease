// frontend/src/screens/RequestsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import api from "../api";

export default function RequestsScreen() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.getPendingRequests();
      setRequests(r?.requests || []);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      await api.approveBooking(id);
      Alert.alert("Approved", "Request approved & room booked.");
      await load();
    } catch (e) {
      if (e?.status === 409) {
        Alert.alert("Conflict", "That room is already approved for this slot.");
      } else {
        Alert.alert("Error", e?.message || "Failed to approve");
      }
    }
  };

  const reject = async (id) => {
    try {
      await api.rejectBooking(id);
      Alert.alert("Rejected", "Request rejected.");
      await load();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to reject");
    }
  };

  const cancel = async (id) => {
    try {
      await api.cancelBooking(id);
      Alert.alert("Cancelled", "Request cancelled.");
      await load();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to cancel");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>🗂️ Pending Requests</Text>
      {loading && (
        <View style={{ alignItems:"center", marginTop:10 }}>
          <ActivityIndicator />
          <Text>Loading…</Text>
        </View>
      )}

      {!loading && !requests.length && <Text style={{ color:"#6b7280" }}>No pending requests.</Text>}

      {requests.map((r) => (
        <View key={r._id} style={styles.card}>
          <Text style={styles.room}>Room: {r.roomNumber || r?.roomId?.roomNumber || "-"}</Text>
          <Text>Date: {r.date}</Text>
          <Text>Slot: {r.slot}</Text>
          <Text>Requested by: {r.requestedBy || r.facultyEmail}</Text>
          <Text>Section: {r.section || "-"}</Text>
          {!!r.reason && <Text>Reason: {r.reason}</Text>}

          <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginTop:10 }}>
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor:"#10B981" }]} onPress={() => approve(r._id)}>
              <Text style={styles.smallBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor:"#EF4444" }]} onPress={() => reject(r._id)}>
              <Text style={styles.smallBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor:"#6B7280" }]} onPress={() => cancel(r._id)}>
              <Text style={styles.smallBtnText}>Cancel</Text>
            </TouchableOpacity>
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
