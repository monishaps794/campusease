// src/services/notification.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Configure how notifications behave when received in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the device for push notifications and returns Expo Push Token
 * Works for physical devices only.
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    if (!Device.isDevice) {
      Alert.alert(
        'Push Notifications',
        'Must use physical device for push notifications.'
      );
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission required',
        'Enable notification permission in settings.'
      );
      return null;
    }

    // ✅ Generate Expo push token (SDK 49+ compatible)
    const { data } = await Notifications.getExpoPushTokenAsync();
    token = data;
    console.log('📱 Expo Push Token:', token);

    // ✅ Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  } catch (err) {
    console.warn('Notification registration failed:', err);
  }

  return token;
}

/**
 * Immediately fires a local notification (no backend needed)
 * @param {string} title
 * @param {string} body
 */
export async function sendLocalNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // immediate
    });
    console.log('📩 Local notification sent:', title);
  } catch (err) {
    console.error('Failed to send local notification:', err);
  }
}
