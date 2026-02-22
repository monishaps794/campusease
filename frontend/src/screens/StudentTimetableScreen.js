// frontend/src/screens/StudentTimetableScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

const ALL_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURADAY"]; // keep typo compat if CSV has it
const SLOTS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];

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

export default function StudentTimetableScreen() {
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ dept: "", year: "", section: "" });
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const u = await getUser();
        // Fallbacks just in case
        const dept = (u?.department || u?.branch || "ISE").toUpperCase();
        const academicYearNum = Number(u?.year || 3);
        const academicYear = Number.isNaN(academicYearNum) ? 3 : academicYearNum;
        const timetableYear = mapAcademicYearToTimetableYear(academicYear);
        const section = (u?.section || "A").toUpperCase();

        // meta shows *academic* year (3rd yr), not 5th sem
        setMeta({ dept, year: String(academicYear), section });

        // ✅ Load full-week rows for this section (5A, 7B, etc)
        const res = await api.getSectionTimetable(dept, timetableYear, section);
        const list = res?.timetable || [];
        setRows(list);
      } catch (err) {
        console.error("StudentTimetableScreen:", err);
        Alert.alert("Error", err?.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build a map DAY__SLOT -> row (subject/faculty/type)
  const grid = useMemo(() => {
    const m = {};
    for (const d of ALL_DAYS) for (const s of SLOTS) m[`${d}__${s}`] = null;
    for (const r of rows) {
      const d = (r.day || "").toUpperCase();
      const t = r.time;
      if (!ALL_DAYS.includes(d) || !SLOTS.includes(t)) continue;
      m[`${d}__${t}`] = r;
    }
    return m;
  }, [rows]);

  // Only show days that actually exist in CSV (hide SATURADAY if absent)
  const daysToShow = useMemo(() => {
    const present = new Set(rows.map((r) => (r.day || "").toUpperCase()));
    return ALL_DAYS.filter((d) => present.has(d));
  }, [rows]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading My Timetable…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>📚 My Timetable</Text>
      <Text style={styles.meta}>
        {meta.dept} • Year {meta.year} • Section {meta.section}
      </Text>

      <View style={{ flex: 1, padding: 8 }}>
        <ScrollView horizontal style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} nestedScrollEnabled>
            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={[styles.headerCell, { width: 160 }]}>
                <Text style={styles.headerText}>Day ↓ / Slot →</Text>
              </View>
              {SLOTS.map((s) => (
                <View key={s} style={[styles.headerCell, { width: 220 }]}>
                  <Text style={styles.headerText}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Rows per day */}
            {daysToShow.map((day) => (
              <View key={day} style={styles.row}>
                <View style={[styles.dayCol, { width: 160 }]}>
                  <Text style={{ fontWeight: "700" }}>{day}</Text>
                </View>
                {SLOTS.map((slot) => {
                  const r = grid[`${day}__${slot}`];
                  return (
                    <View key={slot} style={[{ width: 220 }, styles.cell]}>
                      {r ? (
                        <>
                          <Text style={styles.sub}>{r.subject || "(No subject)"}</Text>
                          <Text style={styles.fac}>{r.faculty || ""}</Text>
                          <Text style={styles.type}>{r.type || ""}</Text>
                        </>
                      ) : (
                        <Text style={styles.empty}>—</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginTop: 12 },
  meta: { textAlign: "center", color: "#374151", marginBottom: 10 },

  headerRow: { flexDirection: "row" },
  headerCell: {
    padding: 10,
    backgroundColor: "#111827",
    borderRightWidth: 1,
    borderRightColor: "#374151",
  },
  headerText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  row: { flexDirection: "row", alignItems: "stretch" },
  dayCol: {
    padding: 10,
    backgroundColor: "#E5E7EB",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },

  cell: {
    minHeight: 80,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#FFFFFF",
  },
  sub: { fontSize: 13, fontWeight: "700" },
  fac: { fontSize: 12, color: "#374151" },
  type: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  empty: { color: "#9CA3AF", fontStyle: "italic" },
});
