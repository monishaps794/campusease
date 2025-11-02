import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import axios from "axios";
import { saveAuthData } from "../utils/storage";

export default function OTPVerifyScreen({ route, navigation }) {
  const { email } = route?.params || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // If your frontend is running on the same laptop and you want localhost:
  // If you use a LAN IP (10.242...), replace these values accordingly.
  const API_BASE =
    Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

  const verifyOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email is missing. Go back and try again.");
      return;
    }
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      console.log("🔹 Backend Response:", res.data);

      if (res.data?.success && res.data?.user) {
        const role = (res.data.user.role || "student").toLowerCase();

        // Save auth info so navigator can read it on restart
        await saveAuthData(res.data.user, "mock-token");

        Alert.alert("Success", "OTP verified — redirecting...", [
          {
            text: "OK",
            onPress: () => {
              const target =
                role === "admin" ? "AdminHome" : role === "faculty" ? "FacultyHome" : "StudentHome";

              navigation.reset({
                index: 0,
                routes: [{ name: target }],
              });
            },
          },
        ]);
      } else {
        Alert.alert("Invalid OTP", res.data?.message || "Incorrect or expired OTP.");
      }
    } catch (error) {
      console.error("❌ OTP Verify Error:", error.response?.data || error.message);
      if (error.message.includes("Network Error")) {
        Alert.alert("Connection Error", "Cannot reach backend. Ensure server at localhost:5000.");
      } else {
        Alert.alert("Error", error.response?.data?.message || "OTP verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>OTP sent to: {email || "Unknown"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />

      <View style={styles.buttonWrapper}>
        <Button title={loading ? "Verifying..." : "Verify OTP"} onPress={verifyOtp} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: "center", color: "#666", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 15 },
  buttonWrapper: { ...Platform.select({ web: { pointerEvents: "auto" } }) },
});
