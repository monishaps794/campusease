import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform } from "react-native";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

  // 🟢 Step 1: Request OTP
  const requestOtp = async () => {
    if (!email.trim()) return Alert.alert("Error", "Please enter your email");

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/auth/request-otp`, { email: email.trim().toLowerCase() });

      if (res.data?.success) {
        Alert.alert("Success", "OTP sent! Check console or email.");
        setStep("otp");
      } else {
        Alert.alert("Error", res.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("❌ OTP Request Error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Step 2: Verify OTP
 // 🟢 Step 2: Verify OTP
const verifyOtp = async () => {
  if (!otp.trim()) return Alert.alert("Error", "Enter the OTP");

  try {
    setLoading(true);
    const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
      email,
      otp,
    });

    if (res.data?.success) {
      const role = res.data.user.role.toLowerCase();

      Alert.alert("Success", `Logged in as ${role}`);

      if (role === "admin") navigation.replace("AdminHome");
      else if (role === "faculty") navigation.replace("FacultyHome");
      else navigation.replace("StudentHome");
    } else {
      Alert.alert("Error", res.data?.message || "OTP verification failed");
    }
  } catch (err) {
    console.error("❌ OTP Verify Error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Verification failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusEase Login</Text>

      {step === "email" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Button
            title={loading ? "Sending..." : "Get OTP"}
            onPress={requestOtp}
            disabled={loading}
          />
        </>
      ) : (
        <>
          <Text style={{ marginBottom: 10 }}>OTP sent to {email}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <Button
            title={loading ? "Verifying..." : "Verify OTP"}
            onPress={verifyOtp}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
});
