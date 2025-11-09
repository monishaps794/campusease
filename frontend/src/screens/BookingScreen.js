// frontend/src/screens/BookingScreen.js
import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  TextInput, Alert, StyleSheet, Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../api";
import { getUser } from "../utils/storage";

const SLOTS = [
  "8:30-9:30",
  "9:30-10:30",
  "11:00-12:00",
  "12:00-1:00",
  "2:00-3:00",
  "3:00-4:00",
];
const SECTIONS = ["3A","3B","3C","5A","5B","5C","7A","7B"]; // ⛔ no 7C in faculty flow

const todayISO = () => new Date().toISOString().split("T")[0];

export default function BookingScreen() {
  const [me, setMe] = useState(null);

  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState("");
  const [section, setSection] = useState(SECTIONS[0]);
  const [reason, setReason] = useState("");

  const [rooms, setRooms] = useState([]);      // available only
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setMe(u);
    })();
  }, []);

  const checkAvailability = async () => {
    if (!slot) return Alert.alert("Missing", "Pick a time slot.");
    try {
      setChecking(true);
      const resp = await api.getAvailableRooms({ date, slot });
      // Faculty should only see rooms that are truly free and NOT reserved by 7C.
      const free = (resp?.available || []).filter(Boolean);
      setRooms(free);
      if (!free.length) {
        Alert.alert("No rooms", "No free rooms for that date/slot.");
      }
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to fetch availability");
    } finally {
      setChecking(false);
    }
  };

  const request = async (roomNumber) => {
    if (!me?.email) return Alert.alert("Error", "Your session has no email.");
    if (!slot) return Alert.alert("Missing", "Pick a time slot.");
    try {
      setLoading(true);
      const payload = {
        facultyEmail: me.email,
        roomNumber,
        date,
        slot,
        reason: (reason || "").trim(),
        branch: "ISE",
        year: section.charAt(0),
        section,
      };
      const res = await api.requestBooking(payload);
      Alert.alert("Requested ✅", res?.message || "Request sent to admin.");
      setReason("");
      // re-check so the just-requested room still appears free to others (it *should*;
      // requests are pending until admin approves). We do not remove it here.
    } catch (e) {
      // In case admin already booked it meanwhile
      if (e?.status === 409) {
        Alert.alert("Sorry", "That room just got booked. Pick another room.");
        await checkAvailability();
      } else {
        Alert.alert("Error", e?.message || "Failed to submit request");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>🎓 Faculty — Request Classroom</Text>

      <Text style={styles.label}>Date</Text>
      {Platform.OS === "web" ? (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.htmlDate}
        />
      ) : (
        <Text style={{ marginBottom: 8 }}>{date}</Text>
      )}

      <Text style={styles.label}>Time Slot</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={slot} onValueChange={setSlot}>
          <Picker.Item label="Select slot…" value="" />
          {SLOTS.map((s) => <Picker.Item label={s} value={s} key={s} />)}
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

      <TouchableOpacity style={styles.btnPrimary} onPress={checkAvailability}>
        <Text style={styles.btnText}>Check Available Rooms</Text>
      </TouchableOpacity>
      {checking && <ActivityIndicator style={{ marginTop: 8 }} />}

      <Text style={styles.h2}>🟩 Available ({rooms.length})</Text>
      <View style={styles.grid}>
        {rooms.map((r) => (
          <View key={r.roomNumber} style={[styles.card, { borderColor: "#10B981" }]}>
            <Text style={styles.room}>{r.roomNumber}</Text>
            <Text style={styles.meta}>{r.type || "Lecture Hall"}</Text>
            <TouchableOpacity
              disabled={loading}
              style={[styles.smallBtn, { backgroundColor:"#10B981", opacity: loading ? 0.7 : 1 }]}
              onPress={() => request(r.roomNumber)}
            >
              <Text style={styles.smallBtnText}>Request</Text>
            </TouchableOpacity>
          </View>
        ))}
        {!rooms.length && <Text style={styles.empty}>No rooms free for the selected date & slot.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, backgroundColor: "#f8f9fa", paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 6 },
  input: {
    padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    backgroundColor: "#fff", minHeight: 44,
  },
  htmlDate: {
    padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    backgroundColor: "#fff", width: 200, marginBottom: 8,
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
