import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import FacultyDashboard from "../screens/Faculty/FacultyDashboard";
import MyBookings from "../screens/Faculty/MyBookings";
import NotificationsScreen from "../screens/Faculty/NotificationsScreen";
import TimetableScreen from "../screens/Faculty/TimetableScreen"; // ✅ NEW

const Tab = createBottomTabNavigator();

export default function FacultyTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2E86DE",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = "home-outline";
          else if (route.name === "Bookings") iconName = "calendar-outline";
          else if (route.name === "Notifications") iconName = "notifications-outline";
          else if (route.name === "Timetable") iconName = "time-outline"; // ✅ added
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={FacultyDashboard} />
      <Tab.Screen name="Bookings" component={MyBookings} />
      <Tab.Screen name="Timetable" component={TimetableScreen} /> {/* ✅ NEW */}
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
