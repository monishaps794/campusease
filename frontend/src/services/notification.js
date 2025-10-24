import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const sendLocalNotification = async (title, body) => {
  if (Platform.OS === "web") {
    console.log(`ℹ️ Web mode: Skipping local notification -> ${title}: ${body}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (error) {
    console.error("❌ Failed to send local notification:", error);
  }
};
