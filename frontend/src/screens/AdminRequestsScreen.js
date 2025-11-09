// frontend/src/screens/AdminRequestsScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import api from "../api";

export default function AdminRequestsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "pending"

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        filter === "pending"
          ? await api.getPendingRequests()
          : await api.getAllBookings();

      const list =
        data?.bookings || data?.pending || data?.requests || [];

      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("❌ Fetch bookings error:", err);
      Alert.alert("Error", "Failed to load booking requests.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const approve = async (id) => {
    try {
      await api.approveBooking(id);
      await load();
    } catch (err) {
      Alert.alert("Action failed", err?.message || "Could not approve.");
    }
  };

  const reject = async (id) => {
    try {
      await api.rejectBooking(id);
      await load();
    } catch (err) {
      Alert.alert("Action failed", err?.message || "Could not reject.");
    }
  };

  const cancel = async (id) => {
    Alert.alert("Cancel booking", "Are you sure you want to cancel?", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await api.cancelBooking(id);
            await load();
          } catch (err) {
            Alert.alert("Action failed", err?.message || "Could not cancel.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const status = (item.status || "").toLowerCase();
    const room =
      item.roomId?.roomNumber || item.roomNumber || "-";
    const date = item.date || "-";
    const slot = item.slot || "-";
    const requestedBy = item.facultyEmail || item.requestedBy || "-";

    return (
      <View style={styles.card}>
        <View style={styles.rowSpace}>
          <Text style={styles.roomText}>{room}</Text>
          <View style={[styles.badge, badgeStyle(status)]}>
            <Text style={styles.badgeText}>{status.toUpperCase() || "UNKNOWN"}</Text>
          </View>
        </View>

        <Text style={styles.meta}>Date: {date}</Text>
        <Text style={styles.meta}>Slot: {slot}</Text>
        <Text style={styles.meta}>Requested by: {requestedBy}</Text>

        <View style={styles.actionsRow}>
          {status === "pending" && (
            <>
              <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => approve(item._id)}>
                <Text style={styles.btnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => reject(item._id)}>
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {status === "approved" && (
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => cancel(item._id)}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Requests</Text>

      {/* Filter toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={filter === "all" ? styles.filterTextActive : styles.filterText}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === "pending" && styles.filterActive]}
          onPress={() => setFilter("pending")}
        >
          <Text style={filter === "pending" ? styles.filterTextActive : styles.filterText}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No requests to show.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const badgeStyle = (status) => {
  switch (status) {
    case "approved":
      return { backgroundColor: "#DCFCE7", borderColor: "#16A34A" };
    case "rejected":
      return { backgroundColor: "#FEE2E2", borderColor: "#DC2626" };
    case "pending":
      return { backgroundColor: "#FEF3C7", borderColor: "#D97706" };
    case "cancelled":
      return { backgroundColor: "#E5E7EB", borderColor: "#6B7280" };
    default:
      return { backgroundColor: "#E5E7EB", borderColor: "#9CA3AF" };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },

  filterRow: { flexDirection: "row", justifyContent: "center", marginBottom: 12 },
  filterPill: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  filterActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  filterText: { color: "#333" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rowSpace: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomText: { fontSize: 18, fontWeight: "700" },
  badge: {
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#111827" },

  meta: { fontSize: 14, marginTop: 4, color: "#374151" },

  actionsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  btn: { padding: 10, borderRadius: 8, minWidth: 100, alignItems: "center", marginLeft: 8 },
  btnText: { color: "#fff", fontWeight: "bold" },
  btnApprove: { backgroundColor: "#16A34A" },
  btnReject: { backgroundColor: "#DC2626" },
  btnCancel: { backgroundColor: "#6B7280" },
});
