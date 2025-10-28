// frontend/src/screens/AuthLoading.js
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { getAuthData } from "../utils/storage";

export default function AuthLoading({ navigation }) {
  useEffect(() => {
    const checkLogin = async () => {
      const { user, token } = await getAuthData();
      if (user && token) {
        if (user.role === "faculty") navigation.replace("FacultyHome");
        else if (user.role === "admin") navigation.replace("AdminHome");
        else navigation.replace("StudentSelect");
      } else {
        navigation.replace("Login");
      }
    };
    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
