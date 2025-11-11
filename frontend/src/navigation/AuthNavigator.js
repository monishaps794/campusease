// frontend/src/navigation/AuthNavigator.js
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getAuthData } from "../utils/storage";

// AUTH
import LoginScreen from "../screens/LoginScreen";
import OTPVerifyScreen from "../screens/OTPVerifyScreen";

// HOMES
import StudentHome from "../screens/StudentHome";
import FacultyHome from "../screens/FacultyHome";
import AdminHome from "../screens/AdminHome";

// STUDENT
import StudentTimetableScreen from "../screens/StudentTimetableScreen";
import StudentBookingsScreen from "../screens/StudentBookingsScreen";

// FACULTY
import FacultyTimetableScreen from "../screens/FacultyTimetableScreen";
import BookingScreen from "../screens/BookingScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";

// ADMIN
import AdminAllocationScreen from "../screens/AdminAllocationScreen";
import SavedAllocations from "../screens/SavedAllocations";
import AdminTimetableScreen from "../screens/AdminTimetableScreen";
import AdminBookClassroom from "../screens/AdminBookClassroom";
import RequestsScreen from "../screens/RequestsScreen";
import AllBookingsScreen from "../screens/AllBookingsScreen";
import UploadDataScreen from "../screens/UploadDataScreen";
import AdminClassroomMap from "../screens/AdminClassroomMap";

// COMMON
import StaffroomScreen from "../screens/StaffroomScreen";
import StudentNotificationsScreen from "../screens/StudentNotificationsScreen";
import FacultyNotificationsScreen from "../screens/FacultyNotificationsScreen";
import AdminNotificationsScreen from "../screens/AdminNotificationsScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getAuthData();
      if (!data?.token) return setInitialRoute("Login");

      const role = data.user.role;
      if (role === "admin") setInitialRoute("AdminHome");
      else if (role === "faculty") setInitialRoute("FacultyHome");
      else setInitialRoute("StudentHome");
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName={initialRoute}>
      {/* AUTH */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />

      {/* HOMES */}
      <Stack.Screen name="StudentHome" component={StudentHome} />
      <Stack.Screen name="FacultyHome" component={FacultyHome} />
      <Stack.Screen name="AdminHome" component={AdminHome} />

      {/* STUDENT */}
      <Stack.Screen name="StudentTimetable" component={StudentTimetableScreen} />
      <Stack.Screen name="StudentBookings" component={StudentBookingsScreen} />
      <Stack.Screen name="StudentNotifications" component={StudentNotificationsScreen} />

      {/* FACULTY */}
      <Stack.Screen name="FacultyTimetable" component={FacultyTimetableScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="FacultyNotifications" component={FacultyNotificationsScreen} />

      {/* ADMIN */}
      <Stack.Screen name="AdminAllocation" component={AdminAllocationScreen} />
      <Stack.Screen name="SavedAllocations" component={SavedAllocations} />
      <Stack.Screen name="AdminTimetable" component={AdminTimetableScreen} />
      <Stack.Screen name="AdminBookClassroom" component={AdminBookClassroom} />
      <Stack.Screen name="AdminRequests" component={RequestsScreen} />
      <Stack.Screen name="AllBookings" component={AllBookingsScreen} />
      <Stack.Screen name="UploadData" component={UploadDataScreen} />
      <Stack.Screen name="AdminClassroomMap" component={AdminClassroomMap} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />

      {/* COMMON */}
      <Stack.Screen name="Staffrooms" component={StaffroomScreen} />
    </Stack.Navigator>
  );
}
