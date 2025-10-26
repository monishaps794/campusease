// campusease-mobile/src/screens/RequestsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from "react-native";
import api from "../api";

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const data = await api.getPendingRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load requests");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, action) => {
    try {
      if (action === "approve") {
        const res = await api.approveBooking(id);
        Alert.alert("Done", res.message || "Approved");
      } else {
        const res = await api.rejectBooking(id);
        Alert.alert("Done", res.message || "Rejected");
      }
      load();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Action failed");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>Pending Booking Requests</Text>

      {!requests.length && <Text>No pending requests.</Text>}

      {requests.map((r) => (
        <View key={r._id} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 }}>
          <Text style={{ fontWeight: "600" }}>{r.roomNumber || r.roomId || r.roomId?.roomNumber}</Text>
          <Text>Requested By: {r.requestedBy}</Text>
          <Text>Date: {r.date}</Text>
          <Text>Slot: {r.slot}</Text>
          {r.reason && <Text>Reason: {r.reason}</Text>}

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <TouchableOpacity onPress={() => act(r._id, "approve")} style={[styles.btn, { backgroundColor: "green" }]}>
              <Text style={{ color: "#fff" }}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => act(r._id, "reject")} style={[styles.btn, { backgroundColor: "red" }]}>
              <Text style={{ color: "#fff" }}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = {
  btn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
};
