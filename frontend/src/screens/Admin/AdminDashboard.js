import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboard() {
  const [data, setData] = useState({ rooms: [], staffrooms: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // const res = await api.get('/admin/overview');
        const res = {
          data: {
            rooms: [
              { id: '1', name: 'A-101', status: 'running' },
              { id: '2', name: 'B-203', status: 'empty' },
              { id: '3', name: 'C-301', status: 'booked' },
            ],
            staffrooms: [
              { id: 's1', name: 'Staffroom A', total: 10, present: 6 },
              { id: 's2', name: 'Staffroom B', total: 10, present: 8 },
            ],
          },
        };
        setData(res.data);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <Text style={styles.subHeader}>Classrooms & Labs</Text>
      <FlatList
        data={data.rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.roomCard}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status.toUpperCase()}</Text>
          </View>
        )}
      />

      <Text style={styles.subHeader}>Staffroom Summary</Text>
      <FlatList
        data={data.staffrooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffDetails}>
              {item.present}/{item.total} Present
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const getStatusStyle = (status) => {
  switch (status) {
    case 'running':
      return { color: '#27AE60' };
    case 'booked':
      return { color: '#F39C12' };
    default:
      return { color: '#E74C3C' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  header: { fontSize: 24, fontWeight: '700', color: '#2E86DE', marginVertical: 10, textAlign: 'center' },
  subHeader: { fontSize: 18, fontWeight: '600', color: '#34495E', marginVertical: 8 },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 6,
    elevation: 2,
  },
  roomName: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  status: { fontWeight: '700' },
  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    elevation: 2,
  },
  staffName: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  staffDetails: { fontSize: 14, color: '#7F8C8D' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
