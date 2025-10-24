// src/screens/Auth/OtpScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function OtpScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      Alert.alert("Error", "Email and OTP are required.");
      return;
    }

    setLoading(true);

    try {
      console.log("🔹 Verifying OTP for:", email);
      const res = await api.post("/auth/verify-otp", { email, otp });
      const data = res.data;

      // ✅ Save token & user if valid
      if (data?.token && data?.user) {
        const userData = { ...data.user, token: data.token };

        await AsyncStorage.setItem("user", JSON.stringify(userData));
        global.user = userData;
        login(userData);

        console.log("✅ User saved with token:", data.token);

        // ✅ Navigate to MainTabs (root dashboard)
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } else {
        console.warn("⚠️ Invalid response:", data);
        Alert.alert("Login failed", "Invalid OTP or missing token.");
      }
    } catch (err) {
      console.error("❌ OTP verification failed:", err);
      Alert.alert("Verification Failed", err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>OTP sent to {email}</Text>

      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: "#8fbdf4" }]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", color: "#2E86DE", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  button: { backgroundColor: "#2E86DE", padding: 14, borderRadius: 10, width: "90%" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 16 },
});
