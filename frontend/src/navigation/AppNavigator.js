import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

import LoginScreen from "../screens/Auth/LoginScreen";
import OtpScreen from "../screens/Auth/OtpScreen";
import SelectProfileScreen from "../screens/Student/SelectProfileScreen";
import RoleBasedNavigator from "./RoleBasedNavigator";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="SelectProfile" component={SelectProfileScreen} />
        </Stack.Navigator>
      ) : (
        <RoleBasedNavigator />
      )}
    </NavigationContainer>
  );
}
