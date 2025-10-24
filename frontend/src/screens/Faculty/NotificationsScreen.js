import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { sendLocalNotification } from "../../services/notification";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Function to send notification
  const handleSend = async () => {
    if (!branch.trim() || !year.trim() || !section.trim() || !message.trim()) {
      Alert.alert("Missing Details", "Please fill all fields before sending.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        senderId: user?._id || user?.id,
        branch,
        year,
        section,
        message,
      };

      const res = await api.post("/notifications/send", payload);

      console.log("✅ Notification response:", res.data);

      if (res?.data?.success) {
        sendLocalNotification(
          "Message Sent ✅",
          `Notification sent to ${branch}-${year}-${section}`
        );
        Alert.alert("Success", "Notification sent successfully!");
      } else {
        Alert.alert("Processed", "Notification request processed.");
      }

      // ✅ Reset inputs
      setBranch("");
      setYear("");
      setSection("");
      setMessage("");
    } catch (err) {
      console.error("❌ Notification send failed:", err.message);
      Alert.alert("Error", "Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📢 Send Notification</Text>

        {/* Inputs */}
        <TextInput
          placeholder="Branch (e.g., ISE)"
          style={styles.input}
          value={branch}
          onChangeText={setBranch}
        />
        <TextInput
          placeholder="Year (e.g., 3rd)"
          style={styles.input}
          value={year}
          onChangeText={setYear}
        />
        <TextInput
          placeholder="Section (e.g., A)"
          style={styles.input}
          value={section}
          onChangeText={setSection}
        />
        <TextInput
          placeholder="Write your message..."
          style={[styles.input, styles.textArea]}
          multiline
          value={message}
          onChangeText={setMessage}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendBtn, loading && { backgroundColor: "#8fbdf4" }]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Send Notification</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f8ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E86DE",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  sendBtn: {
    backgroundColor: "#2E86DE",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
