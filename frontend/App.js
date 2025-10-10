// App.js
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import api from './src/services/api';
import { registerForPushNotificationsAsync } from './src/services/notification';
import { connectSocket, disconnectSocket } from './src/services/socket';

function AppContent() {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState(null);

  // 1) Register for push notifications once on app mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (mounted) {
          setExpoPushToken(token || null);
          if (token) console.log('✅ Registered push token:', token);
        }
      } catch (err) {
        console.warn('Push registration failed', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) When a user logs in (or expo token becomes available), send token to backend
  useEffect(() => {
    if (!user || !expoPushToken) return;

    (async () => {
      try {
        // backend endpoint to register token for this user
        // backend should store token so it can later send push notifications
        await api.post('/users/push-token', { userId: user.id || user._id || user.email, token: expoPushToken });
        console.log('Push token sent to backend for user', user.id || user.email);
      } catch (err) {
        console.warn('Failed to send push token to backend', err.message || err);
      }
    })();
  }, [user, expoPushToken]);

  // 3) Connect socket when user is present; disconnect when user logs out
  useEffect(() => {
    if (!user) {
      // ensure socket disconnected if no user
      disconnectSocket();
      return;
    }

    const sock = connectSocket(user.token || null, (socket) => {
      try {
        // subscribe to user channel
        if (user.id || user._id || user.email) {
          socket.emit('subscribe', { channel: `user:${user.id || user._id || user.email}` });
        }

        // subscribe to user's section (if available)
        if (user.branch && user.semester && user.section) {
          const channel = `section:${user.branch}-${user.semester}-${user.section}`;
          socket.emit('subscribe', { channel });
        }

        // optionally subscribe to faculty or admin channels
        if (user.role === 'faculty' && user.id) {
          socket.emit('subscribe', { channel: `faculty:${user.id}` });
        }
        if (user.role === 'admin') {
          socket.emit('subscribe', { channel: `admin:requests` });
        }
      } catch (err) {
        console.warn('Socket subscribe error', err);
      }
    });

    return () => {
      // cleanup on logout/unmount
      disconnectSocket();
    };
  }, [user]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
