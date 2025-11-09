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
import { Picker } from "@react-native-picker/picker";
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

const todayISO = () => new Date().toISOString().split("T")[0];
const isoFromAny = (s) => {
  if (!s) return todayISO();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(s));
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return todayISO();
};

export default function AdminBookClassroom() {
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState("");
  const [section, setSection] = useState(SECTIONS[0]);
  const [reason, setReason] = useState("");

  const [available, setAvailable] = useState([]);
  const [booked, setBooked] = useState([]);
  const [reserved7C, setReserved7C] = useState([]);
  const [loading, setLoading] = useState(false);

  const onDateChange = (s) => setDate(isoFromAny(String(s).slice(0,10)));

  const check = async () => {
    if (!slot) return Alert.alert("Missing", "Pick time slot");
    try {
      setLoading(true);
      const resp = await api.getAvailableRooms({ date, slot });
      setAvailable(resp?.available || []);
      setBooked(resp?.booked || []);
      setReserved7C(resp?.reserved7C || resp?.allocated7C || []);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  };

  const doBook = async (roomNumber, forceOverride = false) => {
    if (!slot) return Alert.alert("Missing", "Pick time slot");
    try {
      setLoading(true);
      const payload = {
        roomNumber,
        date,
        slot,
        branch: "ISE",
        year: section.charAt(0),
        section,
        reason: (reason || "").trim() || `Admin booking for ${section}`,
        ...(forceOverride ? { override: true } : {}),
      };

      const res = forceOverride
        ? await api.adminOverrideBook(payload)
        : await api.adminBook(payload);

      Alert.alert("Success", res?.message || (forceOverride ? "Overridden & booked ✅" : "Booked ✅"));
      await check();
      setReason("");
    } catch (e) {
      // Always offer override on 409
      const mustOfferOverride = e?.status === 409 || /already/i.test(e?.message || "");
      if (mustOfferOverride) {
        Alert.alert(
          "Room already booked",
          "Do you want to override the existing booking?",
          [
            { text: "No" },
            {
              text: "Override",
              onPress: async () => {
                try {
                  const res2 = await api.adminOverrideBook({
                    roomNumber,
                    date,
                    slot,
                    branch: "ISE",
                    year: section.charAt(0),
                    section,
                    reason: (reason || "").trim() || `Admin booking for ${section}`,
                  });
                  Alert.alert("Success", res2?.message || "Overridden & booked ✅");
                  await check();
                  setReason("");
                } catch (e2) {
                  Alert.alert("Error", e2?.message || "Override failed");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", e?.message || "Booking failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.title}>🧭 Admin Direct Classroom Booking</Text>

        <Text style={styles.label}>Date</Text>
        {Platform.OS === "web" ? (
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            style={styles.htmlDate}
          />
        ) : (
          <Text style={{ marginBottom: 8 }}>{date}</Text>
        )}

        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={slot} onValueChange={setSlot}>
            <Picker.Item label="Select slot…" value="" />
            {SLOTS.map((s) => <Picker.Item key={s} label={s} value={s} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Section</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={section} onValueChange={setSection}>
            {SECTIONS.map((s) => <Picker.Item label={s} value={s} key={s} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Reason</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Optional reason"
          style={styles.input}
          multiline
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={check}>
          <Text style={styles.btnText}>Check Availability</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

        {/* Available */}
        <Text style={styles.h2}>🟩 Available ({available.length})</Text>
        <View style={styles.grid}>
          {available.map((r) => (
            <View key={r.roomNumber} style={[styles.card, { borderColor: "#10B981" }]}>
              <Text style={styles.room}>{r.roomNumber}</Text>
              <Text style={styles.meta}>{r.type || "Lecture Hall"}</Text>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor:"#10B981" }]}
                onPress={() => doBook(r.roomNumber, false)}
              >
                <Text style={styles.smallBtnText}>Book</Text>
              </TouchableOpacity>
            </View>
          ))}
          {!available.length && <Text style={styles.empty}>No rooms free.</Text>}
        </View>

        {/* Booked */}
<Text style={styles.h2}>🟥 Booked ({booked.length})</Text>
<View style={styles.grid}>
  {booked.map((r) => (
    <View key={`B-${r.roomNumber}`} style={[styles.card, { borderColor: "#EF4444" }]}>
      <Text style={styles.room}>{r.roomNumber}</Text>
      <Text style={styles.meta}>{r.type || "Lecture Hall"}</Text>

      <View style={{ flexDirection: "row", gap: 6 }}>
        <TouchableOpacity
          style={[styles.smallBtn, { backgroundColor:"#EF4444", flex: 1 }]}
          onPress={() => doBook(r.roomNumber, true)}
        >
          <Text style={styles.smallBtnText}>Override & Book</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallBtn, { backgroundColor:"#6B7280", flex: 1 }]}
          onPress={async () => {
            try {
              await api.cancelByTriplet({ roomNumber: r.roomNumber, date, slot });
              Alert.alert("Cancelled", "Booking cancelled.");
              await check(); // refresh availability
            } catch (e) {
              Alert.alert("Error", e?.message || "Cancel failed");
            }
          }}
        >
          <Text style={styles.smallBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  ))}
  {!booked.length && <Text style={styles.empty}>No bookings blocking.</Text>}
</View>

        {/* 7C Reserved */}
        <Text style={styles.h2}>🟪 Reserved for 7C ({reserved7C.length})</Text>
        <View style={styles.grid}>
          {reserved7C.map((r) => (
            <View key={`R-${r.roomNumber}`} style={[styles.card, { borderColor: "#7C3AED" }]}>
              <Text style={styles.room}>{r.roomNumber}</Text>
              <Text style={styles.meta}>7C Reserved</Text>
            </View>
          ))}
          {!reserved7C.length && <Text style={styles.empty}>No 7C reservations.</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f8f9fa", paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 6 },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 44,
  },
  htmlDate: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff", // ✅ fix invalid 'background'
    width: 200,
    marginBottom: 8,
  },
  pickerBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff" },
  btnPrimary: { backgroundColor: "#2563EB", padding: 12, borderRadius: 10, marginTop: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  h2: { fontSize: 16, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  card: { width: 140, padding: 10, borderRadius: 10, borderWidth: 2, backgroundColor: "#fff", marginRight: 10, marginBottom: 10 },
  room: { fontWeight: "700", fontSize: 16 },
  meta: { fontSize: 12, color: "#6b7280", marginBottom: 8 },
  smallBtn: { paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  smallBtnText: { color: "#fff", fontWeight: "700" },
  empty: { color: "#6b7280", fontStyle: "italic" },
});
