// frontend/src/navigation/AuthNavigator.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OTPVerifyScreen from "../screens/OTPVerifyScreen";
import StudentHome from "../screens/StudentHome";
import FacultyHome from "../screens/FacultyHome";
import AdminHome from "../screens/AdminHome";

import TimetableScreen from "../screens/TimetableScreen";
import BookingScreen from "../screens/BookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import StaffroomScreen from "../screens/StaffroomScreen";
import RequestsScreen from "../screens/RequestsScreen";
import UploadDataScreen from "../screens/UploadDataScreen";
import AdminAllocationScreen from "../screens/AdminAllocationScreen";
import AllBookingsScreen from "../screens/AllBookingsScreen";
import BookingStatusScreen from "../screens/BookingStatusScreen";
import AdminTimetableScreen from "../screens/AdminTimetableScreen";

import { getAuthData } from "../utils/storage";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { user, token } = await getAuthData();
        if (token && user?.role === "admin") setInitialRoute("AdminHome");
        else if (token && user?.role === "faculty") setInitialRoute("FacultyHome");
        else if (token && user?.role === "student") setInitialRoute("StudentHome");
        else setInitialRoute("Login");
      } catch (err) {
        console.error("AuthNavigator init error:", err);
        setInitialRoute("Login");
      }
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: true }}>
        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "CampusEase Login" }} />
        <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} options={{ title: "Verify OTP" }} />

        {/* Dashboards */}
        <Stack.Screen name="StudentHome" component={StudentHome} options={{ title: "Student Dashboard" }} />
        <Stack.Screen name="FacultyHome" component={FacultyHome} options={{ title: "Faculty Dashboard" }} />
        <Stack.Screen name="AdminHome" component={AdminHome} options={{ title: "Admin Dashboard" }} />

        {/* Admin Panels */}
        <Stack.Screen name="AdminAllocation" component={AdminAllocationScreen} options={{ title: "Auto Allocator" }} />
        <Stack.Screen name="AdminRequests" component={RequestsScreen} options={{ title: "Booking Requests" }} />
        <Stack.Screen name="AllBookings" component={AllBookingsScreen} options={{ title: "All Bookings" }} />
        <Stack.Screen name="UploadData" component={UploadDataScreen} options={{ title: "Upload Data" }} />
        <Stack.Screen name="AdminTimetable" component={AdminTimetableScreen} options={{ title: "Timetables" }} />

        {/* Common Screens */}
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Staffroom" component={StaffroomScreen} />
        <Stack.Screen name="BookingStatus" component={BookingStatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
