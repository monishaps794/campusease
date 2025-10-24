import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { sendLocalNotification } from "../../services/notification";

export default function BookingScreen() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [reason, setReason] = useState("");

  // ✅ Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await api.get("/rooms");
        setRooms(res.data || []);
      } catch (err) {
        console.error("❌ Error fetching rooms:", err.message);
        Alert.alert("Error", "Failed to load rooms from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // ✅ Handle booking request
  const handleBooking = async () => {
    if (!selectedRoom || !branch || !year || !section || !reason) {
      Alert.alert("Missing Details", "Please fill all fields before booking.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        facultyId: user._id || user.id,
        roomId: selectedRoom._id || selectedRoom.id,
        branch,
        year,
        section,
        reason,
      };

      const res = await api.post("/bookings/request", payload);
      console.log("✅ Booking created:", res.data);

      sendLocalNotification(
        "Booking Requested",
        `Request sent for ${selectedRoom.name}.`
      );

      Alert.alert("✅ Success", "Your booking request was sent to admin.");

      // reset inputs
      setSelectedRoom(null);
      setBranch("");
      setYear("");
      setSection("");
      setReason("");
    } catch (err) {
      console.error("❌ Booking failed:", err.message);
      Alert.alert("Error", "Failed to send booking request.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading screen
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // ✅ UI Render
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Book a Classroom</Text>

        {/* Room List */}
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.roomCard,
                selectedRoom?._id === item._id && styles.activeRoom,
              ]}
              onPress={() => setSelectedRoom(item)}
            >
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.capacity}>
                Capacity: {item.capacity || "50"}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.info}>No rooms available for booking.</Text>
          }
        />

        {/* Booking Inputs */}
        <TextInput
          placeholder="Branch (e.g., ISE)"
          style={styles.input}
          value={branch}
          onChangeText={setBranch}
        />
        <TextInput
          placeholder="Year (e.g., 5th)"
          style={styles.input}
          value={year}
          onChangeText={setYear}
        />
        <TextInput
          placeholder="Section (e.g., A)"
          style={styles.input}
          value={section}
          onChangeText={setSection}
        />
        <TextInput
          placeholder="Reason for Booking"
          style={[styles.input, { height: 80 }]}
          multiline
          value={reason}
          onChangeText={setReason}
        />

        <TouchableOpacity
          style={[
            styles.bookBtn,
            (!selectedRoom || !reason) && { opacity: 0.6 },
          ]}
          onPress={handleBooking}
        >
          <Text style={styles.bookText}>Send Booking Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#f5f8ff",
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E86DE",
    marginBottom: 15,
    textAlign: "center",
  },
  roomCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeRoom: {
    borderColor: "#2E86DE",
    backgroundColor: "#eaf2ff",
  },
  roomName: { fontSize: 16, fontWeight: "600" },
  capacity: { color: "#555" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 5,
    padding: 10,
  },
  bookBtn: {
    backgroundColor: "#2E86DE",
    padding: 14,
    borderRadius: 8,
    marginTop: 15,
  },
  bookText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  info: { textAlign: "center", color: "#777", marginVertical: 10 },
});
