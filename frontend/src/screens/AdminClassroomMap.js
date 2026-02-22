// frontend/src/screens/AdminClassroomMap.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  Platform,
  TextInput,
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
const SECTIONS = ["3A", "3B", "3C", "5A", "5B", "5C", "7A", "7B", "7C"];

const todayISO = () => new Date().toISOString().split("T")[0];
const isoFromAny = (s) => {
  if (!s) return todayISO();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(s));
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return todayISO();
};

export default function AdminClassroomMap() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [allocation, setAllocation] = useState(null);

  const [date, setDate] = useState(todayISO());
  const [matrix, setMatrix] = useState({});

  const [selected, setSelected] = useState(null); // { roomNumber, slot }
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [bookSection, setBookSection] = useState(SECTIONS[0]);
  const [bookReason, setBookReason] = useState("");
  const [roomBooking, setRoomBooking] = useState(null);

  // 🔍 Load booking details for the selected cell
  useEffect(() => {
    const loadBooking = async () => {
      if (!selected?.roomNumber || !selected?.slot) {
        setRoomBooking(null);
        return;
      }
      try {
        const det = await api.getBookingDetails({
          roomNumber: selected.roomNumber,
          date,
          slot: selected.slot,
        });

        // det is the "data" from axios (because of handle())
        if (!det || det.success === false) {
          setRoomBooking(null);
          return;
        }

        // Try different shapes defensively
        const booking =
          det.booking ||
          det.bookingDetails ||
          det.result ||
          (det.success && det.data) ||
          null;

        // If backend just returns the booking object directly
        const finalBooking =
          booking && typeof booking === "object" && (booking.roomNumber || booking.roomId)
            ? booking
            : (det.roomNumber || det.roomId)
            ? det
            : null;

        setRoomBooking(finalBooking);
      } catch (e) {
        console.log("loadBooking error:", e);
        setRoomBooking(null);
      }
    };

    loadBooking();
  }, [selected, date]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await api.getAllClassrooms();
        const list = Array.isArray(r) ? r : r.classrooms || [];
        const normalized = (list || []).map((c) => ({
          roomNumber: c.roomNumber,
          type: c.type || "Lecture Hall",
          capacity: c.capacity || 60,
        }));
        normalized.sort((a, b) => {
          const al = a.roomNumber.includes("LAB") ? 1 : 0;
          const bl = b.roomNumber.includes("LAB") ? 1 : 0;
          if (al !== bl) return al - bl;
          return a.roomNumber.localeCompare(b.roomNumber);
        });
        setRooms(normalized);

        const a = await api.getLatestAllocation().catch(() => null);
        setAllocation(a?.allocation || null);
      } catch (e) {
        Alert.alert("Error", "Failed to load classrooms/allocation");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!rooms.length) return;
    loadMatrixForDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, date]);

  const loadMatrixForDate = async () => {
    const dISO = isoFromAny(date);
    try {
      const results = {};
      await Promise.all(
        SLOTS.map(async (slot) => {
          const resp = await api.getAvailableRooms({ date: dISO, slot });
          results[slot] = {
            available: resp?.available || [],
            booked: resp?.booked || [],
            reserved7C: resp?.reserved7C || resp?.allocated7C || [],
          };
        })
      );
      setMatrix(results);
      setDate(dISO); // normalize back to ISO
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load availability");
    }
  };

  const statusFor = (slot, roomNumber) => {
    const m = matrix?.[slot] || { available: [], booked: [], reserved7C: [] };
    if ((m.reserved7C || []).some((r) => r?.roomNumber === roomNumber)) return "7C";
    if ((m.booked || []).some((r) => r?.roomNumber === roomNumber)) return "BOOKED";
    if ((m.available || []).some((r) => r?.roomNumber === roomNumber)) return "FREE";
    return "UNKNOWN";
  };

  const cellStyle = (slot, roomNumber) => {
    const st = statusFor(slot, roomNumber);
    if (st === "7C") return [styles.cell, styles.cell7c];
    if (st === "BOOKED") return [styles.cell, styles.cellBooked];
    if (st === "FREE") return [styles.cell, styles.cellFree];
    return [styles.cell, styles.cellUnknown];
  };

  const cellLabel = (slot, roomNumber) => {
    const st = statusFor(slot, roomNumber);
    if (st === "7C") return "7C";
    if (st === "BOOKED") return "Booked";
    if (st === "FREE") return "Free";
    return "-";
  };

  const scheduleForRoom = (roomNumber) => {
    const out = [];
    if (!allocation) return out;
    for (const [sec, recs] of Object.entries(allocation)) {
      if (!Array.isArray(recs)) continue;
      for (const c of recs) {
        const rn = c.room || c.roomNumber;
        if (rn === roomNumber) {
          out.push({
            section: sec,
            day: c.day,
            time: c.slot || c.time,
            subject: c.subject || "",
            manual: !!c.manual,
          });
        }
      }
    }
    return out.sort(
      (a, b) =>
        (a.day || "").localeCompare(b.day || "") ||
        (a.time || "").localeCompare(b.time || "")
    );
  };

  const openCell = (roomNumber, slot) => {
    setSelected({ roomNumber, slot });
    setBookSection(SECTIONS[0]);
    setBookReason("");
    setRoomSchedule(scheduleForRoom(roomNumber));
    setRoomModalOpen(true);
  };

  const canBook = useMemo(() => {
    if (!selected) return false;
    return statusFor(selected.slot, selected.roomNumber) === "FREE";
  }, [selected, matrix]);

  const canOverride = useMemo(() => {
    if (!selected) return false;
    return statusFor(selected.slot, selected.roomNumber) === "BOOKED";
  }, [selected, matrix]);

  const is7C = useMemo(() => {
    if (!selected) return false;
    return statusFor(selected.slot, selected.roomNumber) === "7C";
  }, [selected, matrix]);

  const submitBook = async (override = false) => {
    if (!selected) return;
    try {
      const payload = {
        roomNumber: selected.roomNumber,
        date,
        slot: selected.slot,
        branch: "ISE",
        year: bookSection.charAt(0),
        section: bookSection,
        reason: (bookReason || "").trim() || `Admin booking (${bookSection})`,
        ...(override ? { override: true } : {}),
      };
      const res = override
        ? await api.adminOverrideBook(payload)
        : await api.adminBook(payload);

      Alert.alert(
        "Success",
        res?.message || (override ? "Overridden & booked ✅" : "Booked ✅")
      );
      await loadMatrixForDate();
      setRoomModalOpen(false);
    } catch (e) {
      const mustOfferOverride =
        e?.status === 409 || /already/i.test(e?.message || "");
      if (mustOfferOverride) {
        Alert.alert("Room already booked", "Do you want to override the existing booking?", [
          { text: "No" },
          { text: "Override", onPress: () => submitBook(true) },
        ]);
      } else {
        Alert.alert("Error", e?.message || "Failed to book");
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading classroom data…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>🎬 Classroom Map View</Text>

        <View style={styles.controls}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(isoFromAny(e.target.value))}
              style={styles.htmlDate}
            />
          ) : (
            <Text style={{ marginBottom: 8 }}>{date}</Text>
          )}
          <TouchableOpacity
            style={[styles.smallBtn, { marginLeft: 8 }]}
            onPress={loadMatrixForDate}
          >
            <Text style={styles.smallBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legend}>
          <View
            style={[
              styles.legendItem,
              { backgroundColor: "#D1FAE5", borderColor: "#10B981" },
            ]}
          />
          <Text>Free</Text>
          <View
            style={[
              styles.legendItem,
              { backgroundColor: "#FEE2E2", borderColor: "#EF4444", marginLeft: 12 },
            ]}
          />
          <Text>Booked</Text>
          <View
            style={[
              styles.legendItem,
              { backgroundColor: "#EDE9FE", borderColor: "#7C3AED", marginLeft: 12 },
            ]}
          />
          <Text>7C Reserved</Text>
        </View>
      </View>

      {/* Grid with both scrolls */}
      <View style={styles.gridWrap}>
        <ScrollView horizontal style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} nestedScrollEnabled>
            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={[styles.headerCell, { width: 130 }]}>
                <Text style={styles.headerText}>Room ↓ / Slot →</Text>
              </View>
              {SLOTS.map((s) => (
                <View key={s} style={[styles.headerCell, { width: 150 }]}>
                  <Text style={styles.headerText}>{s}</Text>
                </View>
              ))}
            </View>

            {/* Rows */}
            {rooms.map((r) => (
              <View key={r.roomNumber} style={styles.row}>
                <View style={[styles.roomCol, { width: 130 }]}>
                  <Text style={{ fontWeight: "700" }}>{r.roomNumber}</Text>
                  <Text style={{ fontSize: 11, color: "#6b7280" }}>{r.type}</Text>
                </View>
                {SLOTS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => openCell(r.roomNumber, s)}
                    style={[{ width: 150 }, ...cellStyle(s, r.roomNumber)]}
                    title={`${r.roomNumber} — ${s}`}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700" }}>
                      {cellLabel(s, r.roomNumber)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        visible={roomModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRoomModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {selected?.roomNumber} — {date} — {selected?.slot}
            </Text>

            <Text style={{ marginTop: 10, fontWeight: "700" }}>
              Scheduled Classes (from allocation)
            </Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {roomSchedule.length ? (
                roomSchedule.map((s, i) => (
                  <View
                    key={`${s.day}-${s.time}-${i}`}
                    style={{ borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 6 }}
                  >
                    <Text>
                      {s.day} — {s.time} — {s.subject || "(no subject)"}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#555" }}>
                      {s.section}
                      {s.manual ? " (manual)" : ""}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#6b7280" }}>No scheduled classes in allocation.</Text>
              )}
            </ScrollView>

            <Text style={{ marginTop: 10, fontWeight: "700" }}>Booking Details</Text>
            {roomBooking ? (
              <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: "#eee" }}>
                <Text>Status: {roomBooking.status}</Text>
                <Text>By: {roomBooking.requestedBy || "—"}</Text>
                <Text>Reason: {roomBooking.reason || "—"}</Text>

                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "#DC2626", marginTop: 6 }]}
                  onPress={async () => {
                    await api.cancelByTriplet({
                      roomNumber: selected.roomNumber,
                      date,
                      slot: selected.slot,
                    });
                    setRoomBooking(null); // ✅ Clear UI
                    await loadMatrixForDate();
                    setRoomModalOpen(false);
                  }}
                >
                  <Text style={styles.smallBtnText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ color: "#6b7280" }}>No booking for this slot.</Text>
            )}

            <View
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Text style={{ fontWeight: "600", marginBottom: 6 }}>Admin Book This Room</Text>

              <Text style={{ marginBottom: 4 }}>Section</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={bookSection} onValueChange={(v) => setBookSection(v)}>
                  {SECTIONS.map((s) => (
                    <Picker.Item key={s} label={s} value={s} />
                  ))}
                </Picker>
              </View>

              <Text style={{ marginTop: 8, marginBottom: 4 }}>Reason</Text>
              <TextInput
                value={bookReason}
                onChangeText={setBookReason}
                placeholder="Optional reason"
                style={styles.input}
                multiline
              />

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "#6B7280" }]}
                  onPress={() => setRoomModalOpen(false)}
                >
                  <Text style={styles.smallBtnText}>Close</Text>
                </TouchableOpacity>

                {canBook && (
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#10B981" }]}
                    onPress={() => submitBook(false)}
                  >
                    <Text style={styles.smallBtnText}>Book</Text>
                  </TouchableOpacity>
                )}

                {canOverride && (
                  <>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: "#EF4444" }]}
                      onPress={() => submitBook(true)}
                    >
                      <Text style={styles.smallBtnText}>Override & Book</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: "#6B7280" }]}
                      onPress={async () => {
                        try {
                          await api.cancelByTriplet({
                            roomNumber: selected.roomNumber,
                            date,
                            slot: selected.slot,
                          });
                          Alert.alert("Cancelled", "Booking cancelled.");
                          await loadMatrixForDate();
                          setRoomModalOpen(false);
                        } catch (e) {
                          Alert.alert("Error", e?.message || "Cancel failed");
                        }
                      }}
                    >
                      <Text style={styles.smallBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}

                {is7C && (
                  <View
                    style={[
                      styles.smallBtn,
                      { backgroundColor: "#7C3AED", opacity: 0.85 },
                    ]}
                  >
                    <Text style={styles.smallBtnText}>7C Reserved</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f9fa" },
  topBar: { paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  label: { fontWeight: "600", marginRight: 8 },
  htmlDate: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    width: 200,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  legendItem: { width: 20, height: 20, borderWidth: 2, borderRadius: 5 },

  gridWrap: { flex: 1, padding: 8, paddingBottom: 16, maxHeight: "80vh" },

  headerRow: { flexDirection: "row" },
  headerCell: {
    padding: 10,
    backgroundColor: "#111827",
    borderRightWidth: 1,
    borderRightColor: "#374151",
  },
  headerText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  row: { flexDirection: "row", alignItems: "stretch" },
  roomCol: {
    padding: 10,
    backgroundColor: "#E5E7EB",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },

  cell: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cellFree: { backgroundColor: "#D1FAE5", borderColor: "#10B981" },
  cellBooked: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  cell7c: { backgroundColor: "#EDE9FE", borderColor: "#7C3AED" },
  cellUnknown: { backgroundColor: "#F3F4F6", borderColor: "#9CA3AF" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "92%",
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 44,
    outlineWidth: 1,
    outlineColor: "#999",
  },
  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#2563EB",
  },
  smallBtnText: { color: "#fff", fontWeight: "700" },
});
