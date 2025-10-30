import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import api from "../api";

export default function BookingScreen() {
  const [branch] = useState("ISE");
  const [year] = useState("3");
  const [section] = useState("A");
  const [date, setDate] = useState(new Date());
  const [slot, setSlot] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(false);

  const slots = [
    "8:30-9:30",
    "9:30-10:30",
    "11:00-12:00",
    "12:00-1:00",
    "2:00-3:00",
    "3:00-4:00",
  ];

  // Web date picker handler
  const handleDateChange = (e) => {
    if (Platform.OS === "web") {
      const val = new Date(e.target.value);
      if (!isNaN(val)) setDate(val);
    }
  };

  const fetchAvailableRooms = async () => {
    if (!slot) return Alert.alert("Select a time slot first");

    setLoading(true);
    try {
      const dateString = date.toISOString().split("T")[0];
      const day = date.toLocaleString("en-US", { weekday: "long" });

      const res = await api.getAvailableRooms({
        branch,
        year,
        section,
        date: dateString,
        slot,
        day,
      });

      if (res?.availableRooms?.length) {
        setAvailableRooms(res.availableRooms);
      } else {
        setAvailableRooms([]);
        Alert.alert("No free classrooms found at that slot");
      }
    } catch (err) {
      console.error("fetchAvailableRooms error:", err);
      Alert.alert("Error fetching available rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedRoom || !slot) {
      return Alert.alert("Select both a time slot and a room");
    }

    try {
      const payload = {
        branch,
        year,
        section,
        date: date.toISOString().split("T")[0],
        slot,
        roomNumber: selectedRoom,
        facultyEmail: "faculty@college.edu",
        facultyName: "Faculty User",
      };

      const res = await api.requestBooking(payload);
      Alert.alert("✅ Booking submitted", res.message || "Request sent successfully!");
      setSelectedRoom("");
      setAvailableRooms([]);
    } catch (err) {
      console.error("Booking error:", err);
      Alert.alert("Booking failed", err?.message || "Check backend logs.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        🧑‍🏫 Faculty Booking Panel
      </Text>

      {/* Date Picker */}
      <View style={{ marginBottom: 10 }}>
        <Text>Select Date:</Text>
        {Platform.OS === "web" ? (
          <input
            type="date"
            value={date.toISOString().split("T")[0]}
            onChange={handleDateChange}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginTop: 5,
              cursor: "pointer",
            }}
          />
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "#eee",
              padding: 10,
              borderRadius: 8,
              marginTop: 5,
            }}
          >
            <Text>{date.toDateString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slot Picker */}
      <Text style={{ marginBottom: 5 }}>Select Time Slot:</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {slots.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSlot(s)}
            style={{
              backgroundColor: slot === s ? "#007bff" : "#ccc",
              padding: 8,
              borderRadius: 6,
              margin: 5,
            }}
          >
            <Text style={{ color: slot === s ? "white" : "black" }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fetch Available Rooms */}
      <TouchableOpacity
        onPress={fetchAvailableRooms}
        style={{
          backgroundColor: "#28a745",
          padding: 10,
          borderRadius: 8,
          marginVertical: 10,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "bold" }}>
            🔍 Check Available Rooms
          </Text>
        )}
      </TouchableOpacity>

      {/* Show Free Classrooms */}
      {availableRooms.length > 0 && (
        <>
          <Text style={{ marginBottom: 8 }}>Available Rooms:</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {availableRooms.map((room) => (
              <TouchableOpacity
                key={room}
                onPress={() => setSelectedRoom(room)}
                style={{
                  backgroundColor: selectedRoom === room ? "#0066cc" : "#ddd",
                  padding: 8,
                  borderRadius: 6,
                  margin: 5,
                }}
              >
                <Text
                  style={{
                    color: selectedRoom === room ? "white" : "black",
                  }}
                >
                  {room}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Submit Booking */}
      <TouchableOpacity
        onPress={handleBook}
        style={{
          backgroundColor: "#0066cc",
          padding: 10,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          📅 Submit Booking Request
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
