import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sendLocalNotification } from '../../services/notification';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const stored = await AsyncStorage.getItem('notifications');
    if (stored) setNotifications(JSON.parse(stored));
  };

  const addTestNotification = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Test Alert',
      body: 'This is a sample stored notification.',
      time: new Date().toLocaleString(),
    };
    const updated = [newNote, ...notifications];
    setNotifications(updated);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
    await sendLocalNotification(newNote.title, newNote.body);
  };

  const clearAll = async () => {
    await AsyncStorage.removeItem('notifications');
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={addTestNotification}>
          <Text style={styles.btnText}>Add Test Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.clear]} onPress={clearAll}>
          <Text style={styles.btnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 10 },
  header: { fontSize: 22, fontWeight: '700', color: '#2E86DE', textAlign: 'center', marginVertical: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  btn: { backgroundColor: '#2E86DE', padding: 10, borderRadius: 8 },
  clear: { backgroundColor: '#E74C3C' },
  btnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 50 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  body: { fontSize: 14, color: '#555', marginTop: 4 },
  time: { fontSize: 12, color: '#999', marginTop: 6 },
});
