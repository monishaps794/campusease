import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

export default function TimetableScreen() {
  // ✅ Example timetable data (now includes Saturday)
  const [timetable, setTimetable] = useState([
    { id: "1", day: "Monday", subject: "Data Structures", time: "9:00 - 10:00 AM", room: "Room 101" },
    { id: "2", day: "Monday", subject: "Operating Systems", time: "10:15 - 11:15 AM", room: "Room 102" },
    { id: "3", day: "Tuesday", subject: "DBMS", time: "9:00 - 10:00 AM", room: "Room 201" },
    { id: "4", day: "Tuesday", subject: "Networks", time: "11:30 - 12:30 PM", room: "Room 203" },
    { id: "5", day: "Wednesday", subject: "AI", time: "9:00 - 10:00 AM", room: "Room 301" },
    { id: "6", day: "Wednesday", subject: "Cloud Computing", time: "10:15 - 11:15 AM", room: "Room 302" },
    { id: "7", day: "Thursday", subject: "Software Engineering", time: "9:00 - 10:00 AM", room: "Room 401" },
    { id: "8", day: "Thursday", subject: "Web Technology", time: "11:30 - 12:30 PM", room: "Room 403" },
    { id: "9", day: "Friday", subject: "Mini Project", time: "9:00 - 11:00 AM", room: "Lab 1" },
    { id: "10", day: "Saturday", subject: "Seminar / Workshop", time: "9:30 - 11:00 AM", room: "Seminar Hall" },
    { id: "11", day: "Saturday", subject: "Lab Practice", time: "11:15 - 1:00 PM", room: "Lab 2" },
  ]);

  const [selectedDay, setSelectedDay] = useState("Monday");

  const filteredTimetable = timetable.filter((item) => item.day === selectedDay);

  // ✅ Now includes Saturday
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Timetable</Text>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.activeDayButton,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === day && styles.activeDayText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timetable List */}
      <FlatList
        data={filteredTimetable}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.info}>{item.time}</Text>
            <Text style={styles.info}>{item.room}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noClass}>No classes scheduled for {selectedDay}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f8ff" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E86DE",
    marginBottom: 10,
    textAlign: "center",
  },
  daySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  dayButton: {
    flexBasis: "30%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 5,
    alignItems: "center",
  },
  activeDayButton: {
    backgroundColor: "#2E86DE",
    borderColor: "#2E86DE",
  },
  dayText: { color: "#333", fontWeight: "600" },
  activeDayText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subject: { fontSize: 18, fontWeight: "600", color: "#2E86DE" },
  info: { fontSize: 14, color: "#555" },
  noClass: { textAlign: "center", color: "#888", marginTop: 30 },
});