import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// import screens
import AdminDashboard from '../screens/Admin/AdminDashboard';
import UpdateAvailability from '../screens/Faculty/UpdateAvailability';
import AvailabilityScreen from '../screens/Student/AvailabilityScreen';
import HomeScreen from '../screens/Student/HomeScreen';
import NotificationsScreen from '../screens/Student/NotificationsScreen';
import StaffroomScreen from '../screens/Student/StaffroomScreen';
import TimetableScreen from '../screens/Student/TimetableScreen';
const Tab = createBottomTabNavigator();

export default function RoleBasedNavigator() {
  const { user } = useAuth();

 // if (!user) return null; // fallback while loading
if (!user || !user.role) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading user data...</Text>
    </View>
  );
}
  switch (user.role) {
    case 'student':
      return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Timetable" component={TimetableScreen} />
          <Tab.Screen name="Availability" component={AvailabilityScreen} />
          <Tab.Screen name="Staffrooms" component={StaffroomScreen} />
          <Tab.Screen name="Notifications" component={NotificationsScreen} />

        </Tab.Navigator>
      );

    case 'faculty':
      return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="My Classes" component={TimetableScreen} />
          <Tab.Screen name="Update Status" component={UpdateAvailability} />
        </Tab.Navigator>
      );

    case 'admin':
      return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Dashboard" component={AdminDashboard} />
          <Tab.Screen name="Rooms" component={HomeScreen} />
        </Tab.Navigator>
      );

    default:
      return null;
  }
}
