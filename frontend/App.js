// campusease-mobile/App.js
import 'react-native-reanimated';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 🔹 Auth + Common Screens
import LoginScreen from "./src/screens/LoginScreen";
import OTPVerifyScreen from "./src/screens/OTPVerifyScreen";
import StudentSelectScreen from "./src/screens/StudentSelectScreen";

// 🔹 Student Screens
import StudentHome from "./src/screens/StudentHome";
import TimetableScreen from "./src/screens/TimetableScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";

// 🔹 Faculty Screens
import FacultyHome from "./src/screens/FacultyHome";
import BookingScreen from "./src/screens/BookingScreen";
import MyBookingsScreen from "./src/screens/MyBookingsScreen";

// 🔹 Staff Screens
import StaffroomScreen from "./src/screens/StaffroomScreen";

// 🔹 Admin Screens
import AdminHome from "./src/screens/AdminHome";
import RequestsScreen from "./src/screens/RequestsScreen";
import UploadDataScreen from "./src/screens/UploadDataScreen";

// 🔹 Utils
import { getUser } from "./src/utils/storage";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user) {
        // Redirect by role
        switch (user.role) {
          case "student":
            setInitialRoute("StudentHome");
            break;
          case "faculty":
            setInitialRoute("FacultyHome");
            break;
          case "admin":
            setInitialRoute("AdminHome");
            break;
          default:
            setInitialRoute("Login");
        }
      } else {
        setInitialRoute("Login");
      }
    })();
  }, []);

  if (!initialRoute) {
    // ⏳ Show loader while fetching stored user
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { elevation: 0 },
          headerTitleAlign: "center",
        }}
      >
        {/* 🔹 Auth Flow */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "CampusEase Login" }}
        />
        <Stack.Screen
          name="OTPVerify"
          component={OTPVerifyScreen}
          options={{ title: "Verify OTP" }}
        />
        <Stack.Screen
          name="StudentSelect"
          component={StudentSelectScreen}
          options={{ title: "Select Details" }}
        />

        {/* 🔹 Student Screens */}
        <Stack.Screen name="StudentHome" component={StudentHome} options={{ title: "Student Dashboard" }} />
        <Stack.Screen name="Timetable" component={TimetableScreen} options={{ title: "My Timetable" }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />

        {/* 🔹 Faculty Screens */}
        <Stack.Screen name="FacultyHome" component={FacultyHome} options={{ title: "Faculty Dashboard" }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: "Book Classroom" }} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "My Bookings" }} />

        {/* 🔹 Staff Screen */}
        <Stack.Screen name="Staffroom" component={StaffroomScreen} options={{ title: "Staffroom Locator" }} />

        {/* 🔹 Admin Screens */}
        <Stack.Screen name="AdminHome" component={AdminHome} options={{ title: "Admin Dashboard" }} />
        <Stack.Screen name="Requests" component={RequestsScreen} options={{ title: "Booking Requests" }} />
        <Stack.Screen name="UploadData" component={UploadDataScreen} options={{ title: "Upload Data" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
