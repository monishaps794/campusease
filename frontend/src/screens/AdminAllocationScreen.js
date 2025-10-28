// frontend/src/screens/AdminAllocationScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import api from "../api";

export default function AdminAllocationScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleAutoAllocate = async () => {
    try {
      setLoading(true);
      setResult("");
      const res = await api.post("/allocator/auto");
      if (res.data.success) {
        setResult(res.data.message);
        Alert.alert("Success", res.data.message);
      } else {
        Alert.alert("Error", res.data.message || "Auto allocation failed");
      }
    } catch (err) {
      console.error("auto allocate error:", err);
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Auto Classroom Allocation</Text>
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleAutoAllocate}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Run Auto Allocation</Text>}
      </TouchableOpacity>
      {result ? <Text style={styles.result}>{result}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  result: { textAlign: "center", fontSize: 16, color: "#333", paddingHorizontal: 20 },
});
