import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import api from "../api";

export default function TimetableScreen() {
  const [slots, setSlots] = useState([]);

  const fetchTT = async () => {
    try {
      const res = await fetch(`${api.getTimetable}/ISE/3/A/Monday`);
      const data = await res.json();
      if (data.success) setSlots(data.slots || []);
      else Alert.alert("Error", data.message);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    fetchTT();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Timetable</Text>
      {slots.map((s, i) => (
        <View
          key={i}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 8,
            marginVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text>{s.time}</Text>
          <Text>Subject: {s.subject}</Text>
          <Text>Faculty: {s.faculty}</Text>
          <Text>Room: {s.classroom}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
