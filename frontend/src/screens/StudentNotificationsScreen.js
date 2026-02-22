import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

// Same mapping as in timetable
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

export default function StudentNotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await getUser();
        if (!u) {
          setNotifications([]);
          return;
        }

        // Use stored department string; backend uses same when admin creates notice
        const department = u.department || u.branch || "Information Science";
        const academicYearNum = Number(u.year || 3);
        const academicYear = Number.isNaN(academicYearNum) ? 3 : academicYearNum;
        const year = mapAcademicYearToTimetableYear(academicYear);
        const section = (u.section || "A").toUpperCase();

        const res = await api.getStudentNotifications({ department, year, section });
        const list = res.notifications || res.data || res || [];
        setNotifications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.log("Student notifications error:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading notifications…</Text>
      </View>
    );
  }

  if (!notifications.length) {
    return (
      <View style={styles.centered}>
        <Text>No notifications yet for your section.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔔 My Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, idx) => item._id || String(idx)}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title || "Notice"}</Text>
            <Text style={styles.message}>{item.message}</Text>
            {item.createdAt && (
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 12 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  message: { fontSize: 14, color: "#374151" },
  time: { fontSize: 12, color: "#6B7280", marginTop: 6 },
});
