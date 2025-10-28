// frontend/src/screens/TimetableScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "../api";
import { getAuthData } from "../utils/storage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableScreen({ route }) {
  // you can pass branch/year/section via route.params or load from user
  const [branch, setBranch] = useState(route?.params?.branch || "ISE");
  const [year, setYear] = useState(route?.params?.year || "3");
  const [section, setSection] = useState(route?.params?.section || "A");
  const [day, setDay] = useState(route?.params?.day || "Monday");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { user } = await getAuthData();
      // if you stored branch/year/section in user, auto-fill
      if (user?.department && !route?.params) {
        setBranch(user.department || branch);
        setYear(user.year?.toString() || year);
        setSection(user.section || section);
      }
      fetchDay(day);
    })();
  }, []);

  const fetchDay = async (selectedDay) => {
    try {
      setLoading(true);
      setSlots([]);
      const resp = await api.get(`/timetable/${encodeURIComponent(branch)}/${encodeURIComponent(year)}/${encodeURIComponent(section)}/${encodeURIComponent(selectedDay)}`);
      if (resp && resp.success) {
        setSlots(resp.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Error fetching timetable", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (d) => {
    setDay(d);
    fetchDay(d);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Timetable — {branch} {year} {section}</Text>

      <View style={styles.daysRow}>
        {DAYS.map((d) => (
          <TouchableOpacity key={d} onPress={() => onDayPress(d)} style={[styles.dayBtn, day === d && styles.dayBtnActive]}>
            <Text style={day === d ? styles.dayTextActive : styles.dayText}>{d.slice(0,3)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator size="large" style={{ marginTop: 20 }} /> : (
        <FlatList
          data={slots}
          keyExtractor={(item, idx) => `${item.time}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.slot}>
              <Text style={styles.time}>{item.time}</Text>
              <View style={styles.slotBody}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.faculty}>{item.faculty}</Text>
                <Text style={styles.room}>{item.classroom || "TBA"}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No slots for {day}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  daysRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  dayBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: "#ddd" },
  dayBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  dayText: { color: "#333" },
  dayTextActive: { color: "#fff", fontWeight: "600" },
  slot: { flexDirection: "row", padding: 12, marginBottom: 8, backgroundColor: "#f7f9fc", borderRadius: 8 },
  time: { width: 110, fontWeight: "bold" },
  slotBody: { flex: 1 },
  subject: { fontWeight: "600" },
  faculty: { color: "#444", marginTop: 4 },
  room: { color: "#666", marginTop: 2 },
});
