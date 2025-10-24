// ✅ src/navigation/RootNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

// ✅ Screens
import FacultyDashboard from "../screens/Faculty/FacultyDashboard";
import MyBookings from "../screens/Faculty/MyBookings";
import NotificationsScreen from "../screens/Faculty/NotificationsScreen";

// ✅ Components
import HeaderRight from "../components/HeaderRight"; // <— 🔔 Notification Icon

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* ✅ Faculty Dashboard Screen */}
        <Stack.Screen
          name="FacultyDashboard"
          component={FacultyDashboard}
          options={{
            title: "Dashboard",
            headerRight: () => <HeaderRight />, // 🔔 Notification icon here
          }}
        />

        {/* ✅ Faculty Booking List */}
        <Stack.Screen
          name="MyBookings"
          component={MyBookings}
          options={{
            title: "My Bookings",
            headerRight: () => <HeaderRight />, // optional (you can add here too)
          }}
        />

        {/* ✅ Optional Notification Page */}
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: "Notifications" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
