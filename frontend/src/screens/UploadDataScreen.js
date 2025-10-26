// campusease-mobile/src/screens/UploadDataScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Picker } from "@react-native-picker/picker";
import api from "../api";

export default function UploadDataScreen() {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(false);

  // File picker
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/vnd.ms-excel"],
      });
      if (result.type === "success") setFile(result);
    } catch (err) {
      Alert.alert("Error", "Could not open file picker");
    }
  };

  // Upload file to backend
  const uploadFile = async () => {
    if (!file) return Alert.alert("Missing file", "Please select a CSV file.");
    if (!year || !branch || !section)
      return Alert.alert("Incomplete", "Please select Year, Branch & Section.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type:
          file.mimeType ||
          (Platform.OS === "ios" ? "text/csv" : "application/octet-stream"),
        name: file.name || "data.csv",
      });
      formData.append("year", year);
      formData.append("branch", branch);
      formData.append("section", section);

      const res = await api.post("/upload/timetable", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("✅ Success", res.data?.message || "Upload successful!");
      setFile(null);
      setYear("");
      setBranch("");
      setSection("");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Upload Failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        ⬆️ Upload Data (Timetable / Faculty / Classrooms)
      </Text>

      {/* Pickers */}
      <View style={styles.pickerGroup}>
        <Text style={styles.label}>Year</Text>
        <Picker
          selectedValue={year}
          onValueChange={setYear}
          style={styles.picker}
        >
          <Picker.Item label="Select Year" value="" />
          <Picker.Item label="1st Year" value="1" />
          <Picker.Item label="2nd Year" value="2" />
          <Picker.Item label="3rd Year" value="3" />
          <Picker.Item label="4th Year" value="4" />
        </Picker>

        <Text style={styles.label}>Branch</Text>
        <Picker
          selectedValue={branch}
          onValueChange={setBranch}
          style={styles.picker}
        >
          <Picker.Item label="Select Branch" value="" />
          <Picker.Item label="CSE" value="CSE" />
          <Picker.Item label="ECE" value="ECE" />
          <Picker.Item label="EEE" value="EEE" />
          <Picker.Item label="MECH" value="MECH" />
          <Picker.Item label="CIVIL" value="CIVIL" />
        </Picker>

        <Text style={styles.label}>Section</Text>
        <Picker
          selectedValue={section}
          onValueChange={setSection}
          style={styles.picker}
        >
          <Picker.Item label="Select Section" value="" />
          <Picker.Item label="A" value="A" />
          <Picker.Item label="B" value="B" />
          <Picker.Item label="C" value="C" />
        </Picker>
      </View>

      {/* File picker */}
      <TouchableOpacity style={styles.button} onPress={pickFile}>
        <Text style={styles.btnText}>📂 Select CSV File</Text>
      </TouchableOpacity>
      {file && <Text style={styles.fileName}>{file.name}</Text>}

      {/* Upload button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "green" }]}
        onPress={uploadFile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>🚀 Upload</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafc",
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerGroup: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: "0px 1px 3px rgba(0,0,0,0.2)" },
    }),
  },
  picker: { height: 45 },
  label: { marginTop: 10, color: "#333", fontWeight: "600" },
  button: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    width: 220,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: { color: "#fff", fontSize: 16 },
  fileName: { marginVertical: 10, color: "#333" },
});
