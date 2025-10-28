// frontend/src/screens/BookingScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, FlatList } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../api"; // default export
import { getAuthData } from "../utils/storage";

export default function BookingScreen({ navigation }) {
  const [branch, setBranch] = useState("ISE");
  const [year, setYear] = useState("3");
  const [section, setSection] = useState("A");
  const [slot, setSlot] = useState("8:30-9:30");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facultyEmail, setFacultyEmail] = useState("");

  const slotOptions = [
    "8:30-9:30",
    "9:30-10:30",
    "11:00-12:00",
    "12:00-1:00",
    "2:00-3:00",
    "3:00-4:00"
  ];

  useEffect(() => {
    (async () => {
      const { user } = await getAuthData();
      if (user?.email) setFacultyEmail(user.email);
    })();
  }, []);

  const formattedDate = date.toISOString().split("T")[0];

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const res = await api.getAvailableRooms({ branch, year, section, date: formattedDate, slot });
      // res is { success, available }
      if (res && res.success) {
        setAvailableRooms(res.available || []);
      } else {
        Alert.alert("Error", res.message || "Failed to load.");
      }
    } catch (err) {
      console.error("fetchAvailableRooms error:", err);
      Alert.alert("Error", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (room) => {
    try {
      setLoading(true);
      // Pass the real _id of the classroom
      const payload = {
        roomId: room._id,
        date: formattedDate,
        slot,
        branch,
        year,
        section,
        reason: "Classroom booking",
        requestedBy: facultyEmail || "unknown",
      };
      const res = await api.requestBooking(payload);
      if (res && res.success) {
        Alert.alert("Success", "Booking request sent");
      } else {
        Alert.alert("Error", res.message || "Failed to create booking");
      }
    } catch (err) {
      console.error("handleRequest error:", err);
      Alert.alert("Error", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity style={styles.roomCard} onPress={() => handleRequest(item)} disabled={loading}>
      <Text style={styles.roomName}>{item.roomNumber}</Text>
      <Text>Type: {item.type || "Classroom"}</Text>
      <Text>Capacity: {item.capacity || "-"}</Text>
      <Text>Status: {item.status || "Available"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Book Classroom</Text>

      {/* branch/year/section simple selects */}
      <View style={styles.row}>
        <Text style={styles.label}>Branch</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity style={[styles.pill, branch === "ISE" && styles.pillSelected]} onPress={() => setBranch("ISE")}>
            <Text style={branch === "ISE" ? styles.pillTextSelected : styles.pillText}>ISE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Year</Text>
        <View style={styles.pillRow}>
          {["1","2","3","4"].map(y => (
            <TouchableOpacity key={y} style={[styles.pill, year===y && styles.pillSelected]} onPress={() => setYear(y)}>
              <Text style={year===y?styles.pillTextSelected:styles.pillText}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Section</Text>
        <View style={styles.pillRow}>
          {["A","B","C"].map(s => (
            <TouchableOpacity key={s} style={[styles.pill, section===s && styles.pillSelected]} onPress={() => setSection(s)}>
              <Text style={section===s?styles.pillTextSelected:styles.pillText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Slot</Text>
        <View style={styles.pillRow}>
          {slotOptions.map(s => (
            <TouchableOpacity key={s} style={[styles.pill, slot===s && styles.pillSelected]} onPress={() => setSlot(s)}>
              <Text style={slot===s?styles.pillTextSelected:styles.pillText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
        <Text>📅 {formattedDate}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" onChange={(e, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      <TouchableOpacity style={styles.fetchBtn} onPress={fetchAvailableRooms} disabled={loading}>
        <Text style={{ color: "#fff" }}>{loading ? "Loading..." : "Find Available Rooms"}</Text>
      </TouchableOpacity>

      <FlatList data={availableRooms} renderItem={renderRoom} keyExtractor={i => i._id} ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No rooms available</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },
  heading: { textAlign: "center", fontSize: 20, fontWeight: "bold", marginVertical: 8 },
  row: { marginVertical: 8 },
  label: { fontWeight: "bold", marginBottom: 6 },
  pillRow: { flexDirection: "row", flexWrap: "wrap" },
  pill: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8, marginRight: 8, marginBottom: 6 },
  pillSelected: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  pillText: { color: "#333" },
  pillTextSelected: { color: "#fff" },
  dateBtn: { padding: 10, backgroundColor: "#eee", borderRadius: 8, alignItems: "center", marginVertical: 8 },
  fetchBtn: { backgroundColor: "#28a745", padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 8 },
  roomCard: { backgroundColor: "#f2f4f7", padding: 12, borderRadius: 8, marginVertical: 6 },
  roomName: { fontWeight: "bold", marginBottom: 4 }
});
