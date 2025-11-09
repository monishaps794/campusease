// frontend/src/screens/FacultyTimetableScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURADAY"]; // your CSV uses SATURADAY
const SLOTS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];

const LAB_ROOM = "ISELAB1";
const isLab = (t) => (t || "").toUpperCase().includes("LAB");
const isActivity = (t) =>
  ["ACTIVITY","NO_ROOM","OPEN ELECTIVE","UPSKILL","MAJOR PROJECT","PLACEMENT"].includes((t || "").toUpperCase());

export default function FacultyTimetableScreen() {
  const [loading, setLoading] = useState(true);
  const [facultyName, setFacultyName] = useState("");
  const [rows, setRows] = useState([]);         // raw CSV rows for this faculty
  const [allocIndex, setAllocIndex] = useState({}); // section__DAY__SLOT -> room

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Who am I?
        const u = await getUser();
        let fname = (u?.name || "").trim();
        if (!fname && typeof localStorage !== "undefined") {
          fname = (localStorage.getItem("userName") || "").trim();
        }
        setFacultyName(fname);

        if (!fname) {
          setLoading(false);
          return Alert.alert("Missing name", "Your user has no name. Update user to match CSV (e.g., DR. NIRMALA H).");
        }

        // Load faculty rows from backend CSV
        const res = await api.getFacultyTimetable(fname);
        const list = res?.timetable || [];
        setRows(list);

        // Load latest allocation and build lookup
        const la = await api.getLatestAllocation().catch(() => null);
        const allocation = la?.allocation || {};
        const idx = {};
        for (const [sec, recs] of Object.entries(allocation)) {
          if (!Array.isArray(recs)) continue;
          for (const c of recs) {
            const key = `${sec.toUpperCase()}__${(c.day || "").toUpperCase()}__${c.slot || c.time}`;
            const room = c.room || c.roomNumber || null;
            if (room) idx[key] = room;
          }
        }
        setAllocIndex(idx);
      } catch (e) {
        console.error("FacultyTimetableScreen init:", e);
        Alert.alert("Error", e?.message || "Failed to load timetable.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const gridMap = useMemo(() => {
    const m = {};
    for (const d of DAYS) for (const s of SLOTS) m[`${d}__${s}`] = [];

    for (const r of rows) {
      const d = (r.day || "").toUpperCase();
      const t = r.time;
      if (!DAYS.includes(d) || !SLOTS.includes(t)) continue;

      let room = null;
      if (isLab(r.type)) room = LAB_ROOM;
      else if (isActivity(r.type)) room = null;
      else {
        const secKey = (r.section || "").toUpperCase(); // e.g. 5A
        room = allocIndex[`${secKey}__${d}__${t}`] ?? null;
      }

      m[`${d}__${t}`].push({
        subject: r.subject,
        section: r.section,
        type: r.type,
        room,
      });
    }
    return m;
  }, [rows, allocIndex]);

  const cellStyle = (entries) => {
    if (entries.some((e) => isLab(e.type))) return [styles.cell, styles.cellLab];
    if (entries.some((e) => !isActivity(e.type) && !isLab(e.type))) return [styles.cell, styles.cellTheory];
    if (entries.length === 0) return [styles.cell, styles.cellEmpty];
    return [styles.cell, styles.cellActivity];
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading {facultyName ? `"${facultyName}"` : "faculty"} timetable…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>📚 My Timetable — {facultyName || "Unknown"}</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legBox, { backgroundColor:"#EDE9FE", borderColor:"#7C3AED" }]} /><Text>Lab</Text>
        <View style={[styles.legBox, { backgroundColor:"#DBEAFE", borderColor:"#2563EB", marginLeft:12 }]} /><Text>Theory</Text>
        <View style={[styles.legBox, { backgroundColor:"#F3F4F6", borderColor:"#9CA3AF", marginLeft:12 }]} /><Text>Activity / None</Text>
        <View style={[styles.legBox, { backgroundColor:"#FFFFFF", borderColor:"#E5E7EB", marginLeft:12 }]} /><Text>Empty</Text>
      </View>

      {/* Grid */}
      <View style={{ flex:1, padding:8 }}>
        <ScrollView horizontal style={{ flex:1 }}>
          <ScrollView style={{ flex:1 }} nestedScrollEnabled>
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

            {DAYS.map((day) => (
              <View key={day} style={styles.row}>
                <View style={[styles.dayCol, { width:160 }]}>
                  <Text style={{ fontWeight:"700" }}>{day}</Text>
                </View>
                {SLOTS.map((slot) => {
                  const entries = gridMap[`${day}__${slot}`] || [];
                  return (
                    <View key={slot} style={[{ width:220 }, ...cellStyle(entries)]}>
                      {entries.length === 0 ? (
                        <Text style={styles.emptyText}>—</Text>
                      ) : (
                        <View style={{ width:"100%" }}>
                          {entries.map((e, i) => (
                            <View key={i} style={{ marginBottom:6 }}>
                              <Text style={styles.cellLine1}>{e.subject || "(No subject)"}</Text>
                              <Text style={styles.cellLine2}>
                                {e.section || ""}{e.room ? ` • ${e.room}` : ""}
                              </Text>
                            </View>
                          ))}
                        </View>
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
  screen: { flex:1, backgroundColor:"#f8f9fa" },
  title: { fontSize:22, fontWeight:"bold", textAlign:"center", marginTop:12, marginBottom:10 },

  legend: { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:16, marginBottom: 8 },
  legBox: { width:18, height:18, borderWidth:2, borderRadius:4 },

  headerRow: { flexDirection:"row" },
  headerCell: { padding:10, backgroundColor:"#111827", borderRightWidth:1, borderRightColor:"#374151" },
  headerText: { color:"#fff", fontWeight:"700", fontSize:12 },

  row: { flexDirection:"row", alignItems:"stretch" },
  dayCol: { padding:10, backgroundColor:"#E5E7EB", borderRightWidth:1, borderRightColor:"#d1d5db" },

  cell: {
    minHeight: 86,
    alignItems: "flex-start",
    justifyContent: "center",
    padding:10,
    borderRightWidth: 1,
    borderRightColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cellLab: { backgroundColor:"#EDE9FE", borderColor:"#7C3AED" },
  cellTheory: { backgroundColor:"#DBEAFE", borderColor:"#2563EB" },
  cellActivity: { backgroundColor:"#F3F4F6", borderColor:"#9CA3AF" },
  cellEmpty: { backgroundColor:"#FFFFFF", borderColor:"#E5E7EB" },

  cellLine1: { fontSize:13, fontWeight:"700" },
  cellLine2: { fontSize:12, color:"#374151" },
  emptyText: { color:"#9CA3AF", fontStyle:"italic" },
});
