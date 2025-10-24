import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/request-otp", { email });
      console.log("✅ OTP requested for:", email);
      Alert.alert("OTP Sent", "Please check your email (mock: 123456).");
      navigation.navigate("Otp", { email });
    } catch (err) {
      console.error("❌ OTP request failed:", err.message);
      Alert.alert("Error", "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusEase</Text>
      <TextInput
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Sending..." : "Send OTP"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", color: "#2E86DE", marginBottom: 20 },
  input: { width: "80%", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12 },
  button: { backgroundColor: "#2E86DE", marginTop: 20, padding: 14, borderRadius: 10 },
  buttonText: { color: "#fff", fontSize: 16 },
});
