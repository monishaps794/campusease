// src/screens/AdminHome.js
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function AdminHome() {
  const navigation = useNavigation();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        backgroundColor: "#f8f9fa",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        🧭 Admin Dashboard
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("AdminBooking")}
        style={{
          backgroundColor: "#3f51b5",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Admin Booking
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("AdminAllocation")}
        style={{
          backgroundColor: "#4CAF50",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Run Auto Allocator
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("AdminTimetable")}
        style={{
          backgroundColor: "#2196F3",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          View All Timetables
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("AdminRequests")}
        style={{
          backgroundColor: "#007bff",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Booking Requests
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("AllBookings")}
        style={{
          backgroundColor: "#9c27b0",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          All Bookings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("UploadData")}
        style={{
          backgroundColor: "#ff9800",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Upload Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={{
          backgroundColor: "#f44336",
          padding: 14,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
