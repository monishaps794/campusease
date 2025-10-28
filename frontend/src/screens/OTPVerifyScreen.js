// frontend/src/screens/OTPVerifyScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform } from "react-native";
import axios from "axios";
import { saveAuthData } from "../utils/storage";

export default function OTPVerifyScreen({ route, navigation }) {
  const email = route.params?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://192.168.31.180:5000/auth/verify-otp", { email, otp });

      const { success, token, user, message } = res.data;
      if (!success) {
        Alert.alert("Error", message || "Verification failed");
        return;
      }

      // ✅ unified storage (token + user)
      await saveAuthData({ token, user });

      Alert.alert("Success", "OTP verified successfully");

      // ✅ role-based redirect
      if (user?.role === "admin") navigation.replace("AdminHome");
      else if (user?.role === "faculty") navigation.replace("FacultyHome");
      else navigation.replace("StudentHome");
    } catch (error) {
      console.error("❌ OTP Verify Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP sent to {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <Button
        title={loading ? "Verifying..." : "Verify OTP"}
        onPress={verifyOtp}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    ...Platform.select({
      web: { pointerEvents: "auto" },
    }),
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    ...Platform.select({
      web: { pointerEvents: "auto" },
    }),
  },
});
