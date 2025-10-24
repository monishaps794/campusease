import { useNotifications } from "../contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function HeaderRight() {
  const { hasNew, clearNotification } = useNotifications();

  return (
    <TouchableOpacity onPress={clearNotification}>
      <Ionicons name="notifications" size={24} color={hasNew ? "red" : "gray"} />
    </TouchableOpacity>
  );
}
