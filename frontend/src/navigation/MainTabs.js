// src/navigation/MainTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import FacultyDashboard from "../screens/Faculty/FacultyDashboard";
import BookingScreen from "../screens/Faculty/BookingScreen";
import NotificationsScreen from "../screens/Faculty/NotificationsScreen";
import TimetableScreen from "../screens/Faculty/TimetableScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2E86DE",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#fff", paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = "home";
          else if (route.name === "Booking") iconName = "book";
          else if (route.name === "Notifications") iconName = "notifications";
          else if (route.name === "Timetable") iconName = "calendar";
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={FacultyDashboard} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
    </Tab.Navigator>
  );
}
