// frontend/src/screens/StudentSelectScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  Picker,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { getUser, saveUser } from "../utils/storage";

export default function StudentSelectScreen({ navigation }) {
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");

  const handleContinue = async () => {
    if (!department || !semester) {
      Alert.alert("Missing Info", "Please select both department and semester.");
      return;
    }

    const user = await getUser();
    const updatedUser = { ...user, department, semester };
    await saveUser(updatedUser);

    Alert.alert("Saved", "Your preferences have been saved.");
    navigation.replace("StudentHome");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎓 Student Onboarding</Text>
      <Text style={styles.sub}>Select your Department & Semester</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Department</Text>
        <Picker
          selectedValue={department}
          onValueChange={(value) => setDepartment(value)}
          style={styles.picker}
        >
          <Picker.Item label="-- Select Department --" value="" />
          <Picker.Item label="Computer Science" value="CSE" />
          <Picker.Item label="Electronics" value="ECE" />
          <Picker.Item label="Mechanical" value="ME" />
          <Picker.Item label="Civil" value="CE" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Semester</Text>
        <Picker
          selectedValue={semester}
          onValueChange={(value) => setSemester(value)}
          style={styles.picker}
        >
          <Picker.Item label="-- Select Semester --" value="" />
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
          <Picker.Item label="5" value="5" />
          <Picker.Item label="6" value="6" />
          <Picker.Item label="7" value="7" />
          <Picker.Item label="8" value="8" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleContinue}>
        <Text style={styles.btnText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    justifyContent: "center",
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  sub: { fontSize: 16, color: "#555", marginBottom: 20 },
  pickerContainer: { marginBottom: 15 },
  label: { fontSize: 15, marginBottom: 5 },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
