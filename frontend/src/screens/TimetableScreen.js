// frontend/src/screens/TimetableScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import api from "../api";
import { getUser } from "../utils/storage";

/** Keep these exactly as your backend expects (note SATURADAY) */
const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURADAY"];
const SLOTS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];

/** ----- Local date helpers (avoid toISOString UTC drift) ----- */
const ymdLocal = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${da}`;
};
const startOfWeekMondayLocal = (now = new Date()) => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // local midnight today
  const jsDay = d.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  const delta = (jsDay + 6) % 7; // days since Monday
  d.setDate(d.getDate() - delta);
  return d;
};

const LAB_ROOM = "ISELAB1";
const isLab = (t) => (t || "").toUpperCase().includes("LAB");
const isActivity = (t) =>
  ["ACTIVITY","NO_ROOM","OPEN ELECTIVE","UPSKILL","MAJOR PROJECT","PLACEMENT"].includes((t || "").toUpperCase());

export default function TimetableScreen() {
  const [loading, setLoading] = useState(true);
  const [userSection, setUserSection] = useState({ branch:"ISE", year:"3", section:"A" });
  const [weekStart, setWeekStart] = useState(startOfWeekMondayLocal(new Date())); // local Monday
  const [dayData, setDayData] = useState({}); // { MONDAY: { [slot]: {subject, faculty, type, classroom} } }
  const [bookings, setBookings] = useState([]); // approved section bookings for this week

  // Map day -> local ISO date for current week
  const weekDates = useMemo(() => {
    const map = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      map[DAYS[i]] = ymdLocal(d);
    }
    return map;
  }, [weekStart]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) Identify student section (from user record)
        const u = await getUser();
        if (!u) {
          setLoading(false);
          return Alert.alert("Error", "No user found. Please login again.");
        }
        const branch = (u.department || "ISE").toUpperCase();
        const year = String(u.year || "3");
        const sectionOnly = (u.section || "A").toUpperCase(); // e.g. "A"
        setUserSection({ branch, year, section: sectionOnly });

        // 2) Fetch merged timetable for each day (parallel)
        const perDay = {};
        const dayCalls = DAYS.map(async (dayKey) => {
          const resp = await api.getTimetableMerged(branch, year, sectionOnly, dayKey);
          const slots = resp?.slots || [];
          const bySlot = {};
          for (const s of slots) {
            bySlot[s.time] = {
              subject: s.subject,
              faculty: s.faculty,
              type: s.type,
              classroom: s.classroom || null,
            };
          }
          perDay[dayKey] = bySlot;
        });
        await Promise.all(dayCalls);
        setDayData(perDay);

        // 3) Fetch approved bookings for this section in the visible week
        const from = weekDates[DAYS[0]];                 // Monday date
        const to = weekDates[DAYS[DAYS.length - 1]];     // Saturday date (spelled SATURADAY in keys, date is fine)
        const bres = await api.getSectionBookings({ branch, year, section: sectionOnly, from, to });
        setBookings(bres?.bookings || []);
      } catch (e) {
        console.error("Student Timetable init error:", e);
        Alert.alert("Error", e?.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  // Build booking lookup: "YYYY-MM-DD__slot" -> booking
  const bookingMap = useMemo(() => {
    const m = {};
    for (const b of bookings) {
      m[`${b.date}__${b.slot}`] = b;
    }
    return m;
  }, [bookings]);

  // Resolve cell content (timetable + booking override)
  const cellData = (day, slot) => {
    const base = (dayData?.[day] || {})[slot] || null;
    const b = bookingMap[`${weekDates[day]}__${slot}`];

    // No booking → show timetable as-is
    if (!b) return base;

    // Booking exists → override room; if no base, show minimal "Booked Session"
    if (base) {
      return {
        ...base,
        classroom: b.roomNumber || base.classroom,
        __booked: true,
      };
    }
    return {
      subject: b.reason ? `Booked: ${b.reason}` : "Booked Session",
      faculty: b.facultyName || b.requestedBy || "",
      type: "THEORY",
      classroom: b.roomNumber || null,
      __booked: true,
    };
  };

  const cellStyle = (item) => {
    const bookedBorder = item?.__booked ? styles.cellBookedBorder : null;
    if (!item) return [styles.cell, styles.cellEmpty, bookedBorder];
    const t = (item.type || "").toUpperCase();
    if (isLab(t)) return [styles.cell, styles.cellLab, bookedBorder];
    if (isActivity(t)) return [styles.cell, styles.cellActivity, bookedBorder];
    return [styles.cell, styles.cellTheory, bookedBorder];
  };

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading timetable…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>📚 My Timetable</Text>
      <Text style={styles.sub}>
        {userSection.branch === "ISE" ? "INFORMATION SCIENCE" : userSection.branch} • Year {userSection.year} • Section {userSection.section}
      </Text>

      {/* Week controls (local dates) */}
      <View style={styles.weekBar}>
        <TouchableOpacity style={styles.weekBtn} onPress={goPrevWeek}>
          <Text style={styles.weekBtnText}>← Prev</Text>
        </TouchableOpacity>
        <Text style={styles.weekRange}>
          {weekDates[DAYS[0]]} → {weekDates[DAYS[DAYS.length - 1]]}
        </Text>
        <TouchableOpacity style={styles.weekBtn} onPress={goNextWeek}>
          <Text style={styles.weekBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legBox, { backgroundColor:"#DBEAFE", borderColor:"#2563EB" }]} /><Text>Theory</Text>
        <View style={[styles.legBox, { backgroundColor:"#EDE9FE", borderColor:"#7C3AED", marginLeft:12 }]} /><Text>Lab</Text>
        <View style={[styles.legBox, { backgroundColor:"#F3F4F6", borderColor:"#9CA3AF", marginLeft:12 }]} /><Text>Activity / None</Text>
        <View style={[styles.legBox, { backgroundColor:"#FFFFFF", borderColor:"#E5E7EB", marginLeft:12 }]} /><Text>Empty</Text>
        <View style={[styles.legBox, { backgroundColor:"#FFFFFF", borderColor:"#DC2626", marginLeft:12 }]} /><Text>Booked Override</Text>
      </View>

      {/* Grid */}
      <View style={{ flex:1, padding:8 }}>
        <ScrollView horizontal style={{ flex:1 }}>
          <ScrollView style={{ flex:1 }} nestedScrollEnabled>
            {/* Header */}
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

            {/* Rows */}
            {DAYS.map((day) => (
              <View key={day} style={styles.row}>
                <View style={[styles.dayCol, { width: 160 }]}>
                  <Text style={{ fontWeight:"700" }}>{day}</Text>
                  <Text style={{ fontSize:11, color:"#6b7280" }}>{weekDates[day]}</Text>
                </View>
                {SLOTS.map((slot) => {
                  const item = cellData(day, slot);
                  return (
                    <View key={slot} style={[{ width:220 }, ...cellStyle(item)]}>
                      {!item ? (
                        <Text style={styles.emptyText}>—</Text>
                      ) : (
                        <View style={{ width:"100%" }}>
                          <Text style={styles.cellLine1}>{item.subject || "(No subject)"}</Text>
                          <Text style={styles.cellLine2}>
                            {item.faculty ? `${item.faculty} • ` : ""}{item.classroom || "—"}
                          </Text>
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
  title: { fontSize:22, fontWeight:"bold", textAlign:"center", marginTop:12 },
  sub: { textAlign:"center", color:"#374151", marginBottom:8 },

  weekBar: { flexDirection:"row", justifyContent:"center", alignItems:"center", gap:10, marginBottom:6 },
  weekBtn: { backgroundColor:"#111827", paddingVertical:6, paddingHorizontal:10, borderRadius:6 },
  weekBtnText: { color:"#fff", fontWeight:"700" },
  weekRange: { fontWeight:"700", color:"#111827" },

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
  cellTheory: { backgroundColor:"#DBEAFE", borderColor:"#2563EB" },
  cellLab: { backgroundColor:"#EDE9FE", borderColor:"#7C3AED" },
  cellActivity: { backgroundColor:"#F3F4F6", borderColor:"#9CA3AF" },
  cellEmpty: { backgroundColor:"#FFFFFF", borderColor:"#E5E7EB" },
  cellBookedBorder: { borderWidth:2, borderColor:"#DC2626" },

  cellLine1: { fontSize:13, fontWeight:"700" },
  cellLine2: { fontSize:12, color:"#374151" },
  emptyText: { color:"#9CA3AF", fontStyle:"italic" },
});
