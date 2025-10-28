// frontend/src/components/AllocationTable.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const colors = [
  "#E8F5E9",
  "#E3F2FD",
  "#FFF3E0",
  "#F3E5F5",
  "#E0F7FA",
  "#FFFDE7",
  "#FCE4EC",
  "#EDE7F6",
];

export default function AllocationTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#999" }}>No allocation data available</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal style={styles.container}>
      <View>
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.header, { width: 100 }]}>Time</Text>
          {data.classrooms.map((room) => (
            <Text key={room} style={[styles.cell, styles.header]}>
              {room}
            </Text>
          ))}
        </View>

        {data.schedule.map((slot, i) => (
          <View key={i} style={styles.row}>
            <Text style={[styles.cell, styles.timeCell]}>{slot.time}</Text>
            {data.classrooms.map((room, j) => {
              const entry = slot.allocations[room];
              return (
                <View
                  key={j}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: entry?.section
                        ? colors[(entry.section.charCodeAt(0) + j) % colors.length]
                        : "#fff",
                    },
                  ]}
                >
                  {entry?.section ? (
                    <>
                      <Text style={styles.section}>{entry.section}</Text>
                      <Text style={styles.subject}>{entry.subject}</Text>
                    </>
                  ) : (
                    <Text style={styles.free}>Free</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: "row", backgroundColor: "#1976D2" },
  row: { flexDirection: "row" },
  cell: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 6,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  timeCell: { backgroundColor: "#e3f2fd", fontWeight: "600" },
  section: { fontWeight: "600", fontSize: 13, textAlign: "center" },
  subject: { fontSize: 11, color: "#555", textAlign: "center" },
  free: { fontSize: 11, color: "#999", fontStyle: "italic" },
});
