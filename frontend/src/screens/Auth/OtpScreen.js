// src/screens/Auth/OtpScreen.js
import { useContext, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";

export default function OtpScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Missing OTP", "Please enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      const { token, user } = res.data;

      login({ ...user, token });
      Alert.alert(`Welcome ${user.role}!`);

      // Redirect based on role
      if (user.role === "student") {
        navigation.replace("SelectProfile");
      } else {
        navigation.replace("Home");
      }
    } catch (err) {
      console.error("verify-otp error", err.message);
      Alert.alert("Invalid OTP", "Please enter a valid or unexpired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

      <TextInput
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 26, fontWeight: "700", color: "#2E86DE", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20, textAlign: "center" },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 5,
  },
  button: { backgroundColor: "#2E86DE", padding: 14, borderRadius: 10, width: "90%" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 16 },
  link: { color: "#2E86DE", marginTop: 20 },
});
