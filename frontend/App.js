// App.js
import { useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/notification';

export default function App() {
  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) console.log('✅ Registered push token:', token);
    })();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
