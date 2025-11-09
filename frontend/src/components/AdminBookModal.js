// frontend/src/screens/AdminBookClassroom.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  StyleSheet,
} from "react-native";
import api from "../api";

const SLOTS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];
const SECTIONS = ["3A","3B","3C","5A","5B","5C","7A","7B","7C"];

const weekdayFromDate = (dateStr) => {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleString("en-US", { weekday: "long" });
  } catch {
    return undefined;
  }
};

export default function AdminBookClassroom() {
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [slot, setSlot] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);

  const [available, setAvailable] = useState([]);
  const [booked, setBooked] = useState([]);
  const [reserved7C, setReserved7C] = useState([]);

  const checkAvailability = async () => {
    if (!date || !slot) {
      Alert.alert("Missing", "Select a date and slot first.");
      return;
    }
    try {
      setLoading(true);
      const day = weekdayFromDate(date);
      // backend ignores branch/section for availability; sends 7C reservations & bookings
      const res = await api.getAvailableRooms({
        branch: "ISE",
        year: "3",
        section: "A",
        date,
        slot,
        day,
      });
      setAvailable(res.available || []);
      setBooked(res.booked || []);
      setReserved7C(res.reserved7C || []);
    } catch (e) {
      console.error("checkAvailability:", e);
      Alert.alert("Error", e?.message || "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  };

  const doBook = async (roomNumber, override = false) => {
    if (!section) {
      Alert.alert("Missing", "Pick a section to book for.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        roomNumber,
        date,
        slot,
        reason: `Admin direct booking for ${section}`,
        section,
        branch: "ISE",
        year: section.charAt(0),
        override,
      };
      const res = await api.adminBook(payload);
      Alert.alert("Success", res?.message || "Booked");
      await checkAvailability();
    } catch (e) {
      console.error("adminBook:", e);
      Alert.alert("Error", e?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>🧭 Admin Direct Classroom Booking</Text>

      {/* Date + Slot */}
      <View style={styles.row}>
        <View style={{ marginRight: 12 }}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === "web" ? (
            <TextInput
              value={date}
              onChangeText={setDate}
              style={styles.input}
            />
          ) : (
            <Text style={{ marginVertical: 8 }}>{date}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Time Slot</Text>
          <View style={styles.pillRow}>
            {SLOTS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSlot(s)}
                style={[styles.pill, slot === s && styles.pillActive]}
              >
                <Text style={slot === s ? styles.pillTextActive : styles.pillText}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Section */}
      <Text style={styles.label}>Section</Text>
      <View style={styles.pillRow}>
        {SECTIONS.map((sec) => (
          <TouchableOpacity
            key={sec}
            onPress={() => setSection(sec)}
            style={[styles.pill, section === sec && styles.pillActive]}
          >
            <Text style={section === sec ? styles.pillTextActive : styles.pillText}>
              {sec}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={checkAvailability} style={styles.btnBlue}>
        <Text style={styles.btnText}>🔎 Check Availability</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 12 }} />}

      {/* Results */}
      {(available.length + booked.length + reserved7C.length) > 0 && (
        <>
          <Text style={styles.groupTitle}>🟩 Available ({available.length})</Text>
          <View style={styles.grid}>
            {available.map((r) => (
              <View key={`a-${r.roomNumber}`} style={[styles.card, styles.cardGreen]}>
                <Text style={styles.cardTitle}>{r.roomNumber}</Text>
                <Text style={styles.cardSub}>{r.type || ""}</Text>
                <TouchableOpacity onPress={() => doBook(r.roomNumber, false)} style={styles.cardBtn}>
                  <Text style={{ color: "#fff" }}>Book</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.groupTitle}>🟥 Booked ({booked.length})</Text>
          <View style={styles.grid}>
            {booked.map((r) => (
              <View key={`b-${r.roomNumber}`} style={[styles.card, styles.cardRed]}>
                <Text style={styles.cardTitle}>{r.roomNumber}</Text>
                <Text style={styles.cardSub}>{r.reason || "Booked"}</Text>
                <TouchableOpacity onPress={() => doBook(r.roomNumber, true)} style={[styles.cardBtn, { backgroundColor: "#1F2937" }]}>
                  <Text style={{ color: "#fff" }}>Override & Book</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.groupTitle}>🟪 Reserved for 7C ({reserved7C.length})</Text>
          <View style={styles.grid}>
            {reserved7C.map((r) => (
              <View key={`z-${r.roomNumber}`} style={[styles.card, styles.cardPurple]}>
                <Text style={styles.cardTitle}>{r.roomNumber}</Text>
                <Text style={styles.cardSub}>Reserved by allocator</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  label: { fontWeight: "600", marginBottom: 6 },
  input: { padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, width: 180 },
  pillRow: { flexDirection: "row", flexWrap: "wrap" },
  pill: { borderWidth: 1, borderColor: "#ddd", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  pillActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  pillText: { color: "#333" },
  pillTextActive: { color: "#fff" },
  btnBlue: { backgroundColor: "#007bff", padding: 12, borderRadius: 10, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  groupTitle: { fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  card: { width: 140, padding: 10, margin: 6, borderRadius: 10 },
  cardGreen: { backgroundColor: "#A7F3D0" },
  cardRed: { backgroundColor: "#FCA5A5" },
  cardPurple: { backgroundColor: "#E9D5FF" },
  cardTitle: { fontWeight: "700", textAlign: "center" },
  cardSub: { fontSize: 12, textAlign: "center", color: "#111827" },
  cardBtn: { marginTop: 8, backgroundColor: "#10B981", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
});
