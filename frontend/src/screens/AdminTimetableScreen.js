// frontend/src/screens/AdminTimetableScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];

const BRANCHES = ["ISE"];
const SECTIONS = ["3A", "3B", "3C", "5A", "5B", "5C", "7A", "7B", "7C"];

export default function AdminTimetableScreen() {
  const [branch, setBranch] = useState("ISE");
  const [section, setSection] = useState("3A");
  const [year, setYear] = useState("3");
  const [loading, setLoading] = useState(false);
  const [weekTable, setWeekTable] = useState({});

  useEffect(() => {
    if (section) setYear(section.charAt(0));
    loadWeek();
    // eslint-disable-next-line
  }, [branch, section]);

  const loadWeek = async () => {
    setLoading(true);
    try {
      const secLetter = section.slice(1); // A
      const yr = section.charAt(0); // 3
      const table = {};

      for (const day of DAYS) {
        const res = await api.getTimetable(branch, yr, secLetter, day);
        const slots = (res && res.slots) || [];
        const map = {};
        for (const s of slots) {
          const t = (s.time || "").trim();
          if (!t) continue;
          map[t] = {
            subject: s.subject || "",
            faculty: s.faculty || "",
            classroom: s.classroom || "",
          };
        }
        table[day] = map;
      }
      setWeekTable(table);
    } catch (err) {
      Alert.alert("Error", "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timetables</Text>

      <View style={styles.row}>
        {BRANCHES.map((b) => (
          <TouchableOpacity
            key={b}
            style={[styles.pill, branch === b && styles.pillSelected]}
            onPress={() => setBranch(b)}
          >
            <Text style={branch === b ? styles.pillTextSelected : styles.pillText}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.pill, section === s && styles.pillSelected]}
            onPress={() => setSection(s)}
          >
            <Text style={section === s ? styles.pillTextSelected : styles.pillText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 12 }} />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <ScrollView horizontal contentContainerStyle={{ paddingBottom: 40 }}>
            <View>
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.periodCell]}>
                  <Text style={styles.headerText}>Period</Text>
                </View>
                {DAYS.map((d) => (
                  <View key={d} style={[styles.cell, styles.dayCell]}>
                    <Text style={styles.headerText}>{d.substring(0, 3)}</Text>
                  </View>
                ))}
              </View>

              {PERIODS.map((period) => (
                <View key={period} style={[styles.row, styles.bodyRow]}>
                  <View style={[styles.cell, styles.periodCell]}>
                    <Text style={styles.periodText}>{period}</Text>
                  </View>
                  {DAYS.map((day) => {
                    const slot = weekTable[day]?.[period];
                    return (
                      <View key={day + period} style={[styles.cell, styles.dayCell]}>
                        {slot ? (
                          <>
                            <Text style={styles.subjText}>{slot.subject}</Text>
                            <Text style={styles.facText}>{slot.faculty}</Text>
                            <Text style={styles.roomText}>{slot.classroom}</Text>
                          </>
                        ) : (
                          <Text style={styles.emptyText}>-</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 8 },
  pill: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 8, marginRight: 8 },
  pillSelected: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  pillText: { color: "#333" },
  pillTextSelected: { color: "#fff" },
  headerRow: { backgroundColor: "#f0f0f0" },
  bodyRow: {},
  cell: { borderWidth: 1, borderColor: "#e2e2e2", minHeight: 64, padding: 6 },
  periodCell: { width: 120, backgroundColor: "#fafafa" },
  dayCell: { width: 180 },
  headerText: { fontWeight: "700" },
  periodText: { fontWeight: "600" },
  subjText: { fontWeight: "700" },
  facText: { color: "#333", marginTop: 4 },
  roomText: { color: "#666", marginTop: 2 },
  emptyText: { color: "#aaa" },
});
