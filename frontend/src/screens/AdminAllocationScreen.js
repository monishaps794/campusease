// frontend/src/screens/AdminAllocationScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import api from "../api";

const SECTIONS = ["3A","3B","3C","5A","5B","5C","7A","7B","7C"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SLOTS = ["8:30-9:30","9:30-10:30","11:00-12:00","12:00-1:00","2:00-3:00","3:00-4:00"];

export default function AdminAllocationScreen() {
  const [allocation, setAllocation] = useState({});
  const [section, setSection] = useState("3A");
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [savedAlloc, setSavedAlloc] = useState(null);

  useEffect(() => {
    loadLatest();
  }, []);

  const loadLatest = async () => {
    try {
      const res = await api.getLatestAllocation();
      if (res?.allocation) setAllocation(res.allocation);
      else setAllocation({});
    } catch (err) {
      console.log("Load latest failed:", err);
    }
  };

  const runAllocator = async () => {
    try {
      setLoading(true);
      const res = await api.autoAllocate();
      if (res?.allocation) {
        setAllocation(res.allocation);
        Alert.alert("✅ Allocated", "New classroom allocation has been generated.");
      } else {
        Alert.alert("⚠️ Failed", res?.message || "Allocator did not return data.");
      }
    } catch (err) {
      Alert.alert("❗ Error", err?.message || "Failed to run allocator.");
    } finally {
      setLoading(false);
    }
  };

  const restoreDefault = async () => {
    try {
      setLoading(true);
      const res = await api.restoreDefault();
      if (res?.allocation) {
        setAllocation(res.allocation);
        Alert.alert("✅ Restored", "Default allocation restored.");
      } else {
        Alert.alert("⚠️ Failed", res?.message || "No data.");
      }
    } catch (e) {
      Alert.alert("❗ Error", e?.message || "Failed to restore default.");
    } finally {
      setLoading(false);
    }
  };

  const saveAlloc = async () => {
    try {
      setLoading(true);
      await api.saveAllocation(allocation);
      Alert.alert("✅ Saved", "Allocation stored successfully.");
    } catch (err) {
      Alert.alert("❗ Error", "Failed to save allocation.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const res = await api.getLatestAllocation();
      if (res?.allocation) setSavedAlloc(res.allocation);
      setViewModal(true);
    } catch (err) {
      Alert.alert("Error", "Failed to load saved allocation.");
    }
  };

  const getCell = (day, slot) => {
    const items = allocation[section] || [];
    const found = items.find((x) => (x.day || "").toUpperCase() === day.toUpperCase() && (x.slot || x.time) === slot);
    if (!found) return "—";
    const subj = found.subject || "";
    const rm = found.room || found.roomNumber || "";
    const typ = (found.type || "").toUpperCase();
    const showRoom = typ.includes("LAB") ? "ISELAB1" : (rm || "—");
    const showType = typ ? typ : "THEORY";
    return `${showRoom}\n${showType}\n${subj ? subj : ""}`.trim();
  };

  return (
    <ScrollView style={{ flex: 1, padding: 12, backgroundColor: "#fff" }}>
      <Text style={styles.title}>🏫 Classroom Allocator (Admin)</Text>

      <View style={styles.row}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.pill, section === s && styles.pillActive]}
            onPress={() => setSection(s)}
          >
            <Text style={section === s ? styles.pillTextActive : styles.pillText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.headerCell, { width: 110 }]}>Day / Slot</Text>
            {SLOTS.map((slot) => (
              <Text key={slot} style={[styles.headerCell, { width: 150 }]}>{slot}</Text>
            ))}
          </View>

          {DAYS.map((day) => (
            <View key={day} style={styles.row}>
              <Text style={[styles.dayCell, { width: 110 }]}>{day}</Text>
              {SLOTS.map((slot) => (
                <View key={slot} style={[styles.cell, { width: 150 }]}>
                  <Text style={{ textAlign: "center", fontSize: 11, whiteSpace: Platform.OS === "web" ? "pre-line" : "normal" }}>
                    {getCell(day, slot)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 12 }} />}

      <TouchableOpacity onPress={runAllocator} style={styles.btnBlue}>
        <Text style={styles.btnText}>⚙️ Run Auto Allocator</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={restoreDefault} style={styles.btnOrange}>
        <Text style={styles.btnText}>↩️ Restore Default Allocation</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={saveAlloc} style={styles.btnGreen}>
        <Text style={styles.btnText}>💾 Save Allocation</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={fetchSaved} style={styles.btnGray}>
        <Text style={styles.btnText}>📁 View Last Saved</Text>
      </TouchableOpacity>

      {/* VIEW LAST SAVED MODAL */}
      <Modal visible={viewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📁 Last Saved Allocation</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {savedAlloc ? (
                Object.entries(savedAlloc).map(([sec, items]) => (
                  <View key={sec} style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{sec}</Text>
                    {DAYS.map((d) => (
                      <View key={`${sec}-${d}`} style={{ marginBottom: 6 }}>
                        <Text style={{ fontWeight: "600" }}>{d}</Text>
                        {SLOTS.map((sl) => {
                          const it = (items || []).find((x) => (x.day || "").toUpperCase() === d.toUpperCase() && (x.slot || x.time) === sl);
                          const label = it ? `${sl} — ${(it.room || it.roomNumber || (it.type?.includes("LAB") ? "ISELAB1" : "—"))} (${it.subject || it.type || "THEORY"})` : `${sl} — —`;
                          return <Text key={`${sec}-${d}-${sl}`}>{label}</Text>;
                        })}
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Text>No saved data.</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setViewModal(false)} style={styles.closeBtn}>
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  pill: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 6, marginRight: 6 },
  pillActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  pillText: { color: "#333" },
  pillTextActive: { color: "#fff" },
  headerRow: { backgroundColor: "#f1f5f9" },
  headerCell: { fontWeight: "bold", textAlign: "center", paddingVertical: 4 },
  dayCell: { fontWeight: "bold", textAlign: "center" },
  cell: { borderWidth: 1, borderColor: "#ddd", padding: 6, justifyContent: "center" },
  btnBlue: { backgroundColor: "#2563EB", padding: 12, borderRadius: 8, marginTop: 16 },
  btnOrange: { backgroundColor: "#f59e0b", padding: 12, borderRadius: 8, marginTop: 10 },
  btnGreen: { backgroundColor: "#10B981", padding: 12, borderRadius: 8, marginTop: 10 },
  btnGray: { backgroundColor: "#6b7280", padding: 12, borderRadius: 8, marginTop: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "90%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  closeBtn: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8, marginTop: 12 },
});
