// src/screens/FacultyHome.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../api";
import { getUser, saveUser } from "../utils/storage";

export default function FacultyHome({ navigation }) {
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState("present");

  // Load user details
  useEffect(() => {
    (async () => {
      const storedUser = await getUser();
      setUser(storedUser);
      setAvailability(storedUser?.availability || "present");
    })();
  }, []);

  // Update faculty availability
  const handleAvailabilityChange = async (val) => {
    try {
      const res = await api.put("/faculty/availability", { availability: val });
      await saveUser({ ...user, availability: val });
      setAvailability(val);
      Alert.alert("✅ Updated", `Status changed to ${val}`);
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", "Failed to update availability");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👨‍🏫 Faculty Dashboard</Text>
      <Text style={styles.name}>
        {user?.name || user?.email || "Faculty User"}
      </Text>

      <Text style={styles.section}>Select Availability:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={availability}
          onValueChange={handleAvailabilityChange}
          style={styles.picker}
        >
          <Picker.Item label="Present" value="present" />
          <Picker.Item label="In Class" value="in_class" />
          <Picker.Item label="Unavailable" value="unavailable" />
          <Picker.Item label="Absent" value="absent" />
        </Picker>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Timetable")}
        >
          <Text style={styles.btnText}>📘 My Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Booking")}
        >
          <Text style={styles.btnText}>🏫 Book a Classroom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("MyBookings")}
        >
          <Text style={styles.btnText}>🗂 My Booking Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logout}
          onPress={async () => {
            await saveUser(null);
            navigation.replace("Login");
          }}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafc",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    color: "#555",
  },
  section: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 6,
    ...Platform.select({
      web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    }),
  },
  picker: { height: 50 },
  buttonGroup: { marginTop: 30 },
  btn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
  logout: {
    backgroundColor: "#e63946",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
