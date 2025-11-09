import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import api from "../api";
import { saveAuthData } from "../utils/storage";


export default function OTPVerifyScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState("");

  const verify = async () => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const cleanOtp = otp.trim();

      const data = await api.verifyOtp({ email: cleanEmail, otp: cleanOtp });

      await saveAuthData(data.user, data.token);

      if (data.user.role === "admin") navigation.replace("AdminHome");
      else if (data.user.role === "faculty") navigation.replace("FacultyHome");
      else navigation.replace("StudentHome");

    } catch (e) {
      alert(e.message || "Invalid OTP");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter OTP</Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TouchableOpacity onPress={verify} style={{ backgroundColor: "#007AFF", padding: 14, marginTop: 20 }}>
        <Text style={{ color: "#fff", textAlign: "center" }}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}
