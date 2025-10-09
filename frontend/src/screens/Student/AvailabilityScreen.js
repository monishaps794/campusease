import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function AvailabilityScreen() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Mock data until backend ready
    const fetchFaculty = async () => {
      try {
        // const res = await api.get('/faculty/availability');
        const res = {
          data: [
            { id: 1, name: 'Dr. Nisha', room: 'Staffroom A', status: 'present' },
            { id: 2, name: 'Prof. Ramesh', room: 'Staffroom B', status: 'not available' },
            { id: 3, name: 'Dr. Anita', room: 'Staffroom C', status: 'absent' },
          ],
        };
        setFacultyList(res.data);
      } catch (err) {
        console.error('Error loading faculty:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading faculty availability...</Text>
      </View>
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case 'present':
        return '#27AE60';
      case 'not available':
        return '#F39C12';
      case 'absent':
        return '#E74C3C';
      default:
        return '#BDC3C7';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Faculty Availability</Text>
      <FlatList
        data={facultyList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.left}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.room}>{item.room}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
              <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 10 },
  header: { fontSize: 22, fontWeight: '700', color: '#2E86DE', marginVertical: 15, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  left: {},
  name: { fontSize: 17, fontWeight: '600', color: '#2C3E50' },
  room: { fontSize: 14, color: '#7F8C8D' },
  badge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  status: { color: '#fff', fontWeight: '600', fontSize: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
