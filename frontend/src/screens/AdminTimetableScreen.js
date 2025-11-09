// frontend/src/screens/AdminTimetableScreen.js
import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, ActivityIndicator,
} from "react-native";
import api from "../api";

const BRANCHES = ["ISE"];
const SECTIONS = ["3A","3B","3C","5A","5B","5C","7A","7B","7C"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SLOTS = ["8:30-9:30","9:30-10:30","11:00-12:00","12:00-1:00","2:00-3:00","3:00-4:00"];

export default function AdminTimetableScreen() {
  const [branch, setBranch] = useState("ISE");
  const [section, setSection] = useState("3A");
  const [timetableByDay, setTimetableByDay] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => { fetchAllDays(); }, [branch, section]);

  const fetchAllDays = async () => {
    setLoading(true);
    try {
      const [year, sec] = [section.charAt(0), section.charAt(1)];
      const resByDay = {};
      for (const day of DAYS) {
        const r = await api.getTimetableMerged(branch, year, sec, day);
        resByDay[day] = r?.slots || [];
      }
      setTimetableByDay(resByDay);
    } catch (e) {
      console.error("AdminTimetable fetch err:", e);
      setTimetableByDay({});
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (day, slot) => {
    const list = timetableByDay[day] || [];
    const entry = list.find((x) => x.time === slot);
    if (!entry) return <Text style={styles.emptyCell}>—</Text>;
    const room = entry.classroom || "—";
    return (
      <TouchableOpacity onPress={() => setSelectedCell({ ...entry, day })}>
        <Text style={styles.subject}>{entry.subject || ""}</Text>
        <Text style={{ fontSize: 11 }}>{entry.faculty || ""}</Text>
        <Text style={{ fontSize: 11, color: "#333" }}>{room}</Text>
        <Text style={{ fontSize: 10, color: "#666" }}>{entry.type || ""}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={{ flex: 1, padding: 12, backgroundColor: "#fff" }}>
      <Text style={styles.title}>🗓️ Timetable Matrix (Admin)</Text>

      <View style={styles.row}>
        {BRANCHES.map((b) => (
          <TouchableOpacity key={b} style={[styles.pill, branch === b && styles.pillSelected]} onPress={() => setBranch(b)}>
            <Text style={branch === b ? styles.pillTextSelected : styles.pillText}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        {SECTIONS.map((s) => (
          <TouchableOpacity key={s} style={[styles.pill, section === s && styles.pillSelected]} onPress={() => setSection(s)}>
            <Text style={section === s ? styles.pillTextSelected : styles.pillText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <ScrollView horizontal>
          <View>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.headerCell, { width: 100 }]}>Day ↓ / Slot →</Text>
              {SLOTS.map((slot) => (
                <Text key={slot} style={[styles.headerCell, { width: 140 }]}>{slot}</Text>
              ))}
            </View>
            {DAYS.map((day) => (
              <View key={day} style={styles.row}>
                <Text style={[styles.dayCell, { width: 100 }]}>{day}</Text>
                {SLOTS.map((slot) => (
                  <View key={`${day}-${slot}`} style={[styles.cell, { width: 140 }]}>
                    {renderCell(day, slot)}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal visible={!!selectedCell} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedCell?.subject}</Text>
            <Text>📅 {selectedCell?.day}</Text>
            <Text>⏰ {selectedCell?.time}</Text>
            <Text>👨‍🏫 {selectedCell?.faculty}</Text>
            <Text>🏫 Room: {selectedCell?.classroom || "—"}</Text>
            <Text>🏷️ {selectedCell?.type || ""}</Text>
            <TouchableOpacity onPress={() => setSelectedCell(null)} style={styles.closeBtn}>
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  pill: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  pillSelected: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  pillText: { color: "#333" },
  pillTextSelected: { color: "#fff" },
  headerRow: { backgroundColor: "#f1f5f9", paddingVertical: 4 },
  headerCell: { fontWeight: "bold", textAlign: "center" },
  dayCell: { fontWeight: "bold", textAlign: "center" },
  cell: { borderWidth: 1, borderColor: "#ddd", padding: 6, alignItems: "center", justifyContent: "center" },
  subject: { fontSize: 12, textAlign: "center", fontWeight: "600" },
  emptyCell: { color: "#ccc", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "85%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  closeBtn: { marginTop: 16, backgroundColor: "#007AFF", padding: 10, borderRadius: 8 },
});
