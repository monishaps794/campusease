import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/notifications/${user.branch}/${user.semester}/${user.section}`);
        setNotifications(res.data);
      } catch (err) {
        console.warn('Notification fetch error:', err.message);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.msg}>{item.message}</Text>
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E86DE', marginBottom: 10 },
  card: {
    backgroundColor: '#f4f7ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  msg: { fontSize: 16, color: '#333' },
  meta: { fontSize: 12, color: '#777', marginTop: 4 },
});
