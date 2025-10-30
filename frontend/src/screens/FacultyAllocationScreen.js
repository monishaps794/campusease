// frontend/src/screens/FacultyAllocationScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView, Alert } from "react-native";
import AllocationTable from "../components/AllocationTable";
import axios from "axios";

const BASE_URL = "http://10.242.24.77:5000";

export default function FacultyAllocationScreen({ route }) {
  const facultyEmail = route.params?.email || "";
  const [day, setDay] = useState("Monday");
  const [allocations, setAllocations] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/allocator/allocate?day=${day}`);
      const filtered = {
        classrooms: res.data.classrooms,
        schedule: res.data.schedule.map((slot) => ({
          ...slot,
          allocations: Object.fromEntries(
            Object.entries(slot.allocations).filter(
              ([, val]) => val && val.faculty && val.faculty === facultyEmail
            )
          ),
        })),
      };
      setAllocations(filtered);
    } catch (err) {
      console.error("❌ Faculty allocation error:", err.message);
      Alert.alert("Error", "Failed to load allocation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [day]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📘 My Classroom Allocations — {facultyEmail}</Text>
      <View style={styles.dayRow}>
        {days.map((d) => (
          <Button
            key={d}
            title={d}
            color={day === d ? "#1976D2" : "#aaa"}
            onPress={() => setDay(d)}
          />
        ))}
      </View>
      <Button title={loading ? "Refreshing..." : "🔄 Refresh"} onPress={fetchAllocations} />
      <AllocationTable data={allocations} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  dayRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10, gap: 6 },
});
