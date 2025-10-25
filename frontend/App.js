import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerifyScreen from './src/screens/OTPVerifyScreen';
import StudentSelectScreen from './src/screens/StudentSelectScreen';
import StudentHome from './src/screens/StudentHome';
import TimetableScreen from './src/screens/TimetableScreen';
import StaffroomScreen from './src/screens/StaffroomScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import FacultyHome from './src/screens/FacultyHome';
import BookingScreen from './src/screens/BookingScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import AdminHome from './src/screens/AdminHome';
import RequestsScreen from './src/screens/RequestsScreen';
import { getUser } from './src/utilis/storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      setInitial(user ? user.role : null);
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          // Fix deprecated shadow* props warning
          headerStyle: {
            boxShadow: 'none', // instead of shadowColor/shadowOffset/shadowOpacity
            elevation: 0,       // for Android
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
        <Stack.Screen name="StudentSelect" component={StudentSelectScreen} />
        <Stack.Screen name="StudentHome" component={StudentHome} />
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="Staffroom" component={StaffroomScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="FacultyHome" component={FacultyHome} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="AdminHome" component={AdminHome} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
