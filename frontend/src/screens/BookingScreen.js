// campusease-mobile/src/screens/BookingScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "../api";

export default function BookingScreen({ navigation, route }) {
  const facultyEmail = route?.params?.email || "faculty@example.com";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [reason, setReason] = useState("");

  const fetchRooms = async (params = {}) => {
    try {
      setLoading(true);
      const data = await api.getAvailableRooms(params);
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch available rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!selectedRoom || !date || !slot) {
      Alert.alert("Validation", "Please select room, date and time slot");
      return;
    }
    try {
      const payload = {
        roomId: selectedRoom,
        date,
        slot,
        branch,
        year,
        section,
        reason,
        requestedBy: facultyEmail,
      };
      const res = await api.requestBooking(payload);
      Alert.alert("Success", res.message || "Request sent to admin");
      navigation.navigate("MyBookings", { email: facultyEmail });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create booking request");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>Book a Classroom</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <Text style={{ marginBottom: 8 }}>Choose an available classroom</Text>
          {classrooms.length === 0 && <Text style={{ marginBottom: 8 }}>No available rooms right now.</Text>}

          {classrooms.map((r) => (
            <TouchableOpacity
              key={r._id}
              onPress={() => setSelectedRoom(r._id)}
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: selectedRoom === r._id ? "#007bff" : "#f2f2f2",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: selectedRoom === r._id ? "#fff" : "#000", fontWeight: "600" }}>
                {r.roomNumber || r.room || r._id} {r.blockName ? ` - ${r.blockName}` : ""} (cap: {r.capacity || "N/A"})
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} />
          <TextInput placeholder="Time slot (eg. 9:00-10:00)" value={slot} onChangeText={setSlot} style={styles.input} />
          <TextInput placeholder="Branch" value={branch} onChangeText={setBranch} style={styles.input} />
          <TextInput placeholder="Year" value={year} onChangeText={setYear} style={styles.input} />
          <TextInput placeholder="Section" value={section} onChangeText={setSection} style={styles.input} />
          <TextInput placeholder="Reason (optional)" value={reason} onChangeText={setReason} style={styles.input} />

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Send Request</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
};
