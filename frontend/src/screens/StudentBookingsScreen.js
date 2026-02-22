// frontend/src/screens/StudentBookingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

const toBranch = (dept) => {
  if (!dept) return "";
  const x = String(dept).trim().toUpperCase();
  if (x.includes("INFORMATION")) return "Information Science"; // backend accepts both
  return dept;
};

// Map academic year (1,2,3,4) -> timetable year (1,3,5,7)
const mapAcademicYearToTimetableYear = (year) => {
  const n = Number(year);
  switch (n) {
    case 1:
      return 1;
    case 2:
      return 3;
    case 3:
      return 5;
    case 4:
      return 7;
    default:
      return n || 1;
  }
};

export default function StudentBookingsScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser();
        if (!u) {
          setLoading(false);
          return;
        }

        const branch = toBranch(u.branch || u.department || "");
        const academicYearNum = Number(String(u.year || "").replace(/\D/g, "")) || 3;
        const academicYear = Number.isNaN(academicYearNum) ? 3 : academicYearNum;
        const year = mapAcademicYearToTimetableYear(academicYear); // ✅ 3 → 5
        const section = String(u.section || "").toUpperCase().replace(/^\d+/, ""); // "A"

        const res = await api.getSectionBookings({ branch, year, section });
        if (res?.success) setList(res.bookings || []);
        else Alert.alert("Error", res?.message || "Failed to load bookings");
      } catch (e) {
        console.log("StudentBookings load error:", e);
        Alert.alert("Error", e?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading bookings…</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Classroom Bookings for Your Section</Text>
      <FlatList
        data={list}
        keyExtractor={(i, idx) => i._id || String(idx)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.room}>{item.roomNumber || item?.roomId?.roomNumber || "-"}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Slot: {item.slot}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Booked By: {item.facultyName || item.requestedBy || "-"}</Text>
            <Text>Reason: {item.reason || "-"}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>No bookings.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  room: { fontSize: 16, fontWeight: "bold" },
});
