// frontend/src/navigation/AuthNavigator.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OTPVerifyScreen from "../screens/OTPVerifyScreen";
import StudentHome from "../screens/StudentHome";
import FacultyHome from "../screens/FacultyHome";
import AdminHome from "../screens/AdminHome";
import AllBookingsScreen from "../screens/AllBookingsScreen";

// Extra screens (placeholders if not implemented yet)
import TimetableScreen from "../screens/TimetableScreen";
import BookingScreen from "../screens/BookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import StaffroomScreen from "../screens/StaffroomScreen";
import RequestsScreen from "../screens/RequestsScreen";
import UploadDataScreen from "../screens/UploadDataScreen";
import AdminAllocationScreen from "../screens/AdminAllocationScreen";
import FacultyAllocationScreen from "../screens/FacultyAllocationScreen";

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

  if (!initialRoute) return null; // wait while checking storage

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "CampusEase Login" }} />
        <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} options={{ title: "Verify OTP" }} />

        {/* Dashboards */}
        <Stack.Screen name="StudentHome" component={StudentHome} options={{ title: "Student Dashboard" }} />
        <Stack.Screen name="FacultyHome" component={FacultyHome} options={{ title: "Faculty Dashboard" }} />
        <Stack.Screen name="AdminHome" component={AdminHome} options={{ title: "Admin Dashboard" }} />

        {/* Common screens used by dashboards */}
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Staffroom" component={StaffroomScreen} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="UploadData" component={UploadDataScreen} />
        <Stack.Screen name="AdminAllocation" component={AdminAllocationScreen} />
        <Stack.Screen name="FacultyAllocation" component={FacultyAllocationScreen} />
        <Stack.Screen name="AllBookings" component={AllBookingsScreen} />

              </Stack.Navigator>
    </NavigationContainer>
  );
}
