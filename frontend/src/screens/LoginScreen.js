import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform } from "react-native";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://10.183.195.64:5000/auth/request-otp", { email });

      if (res.data.success) {
        Alert.alert("✅ OTP Sent", `OTP sent to ${email}`);
        navigation.navigate("OTPVerify", { email: email.toLowerCase().trim() });
      } else {
        Alert.alert("Error", res.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP Request Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusEase Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.buttonWrapper}>
        <Button title={loading ? "Sending..." : "Get OTP"} onPress={requestOtp} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 15,
    ...Platform.select({ web: { pointerEvents: "auto" } }),
  },
  buttonWrapper: { ...Platform.select({ web: { pointerEvents: "auto" } }) },
});
