import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function TimetableScreen() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Mock data until backend ready
    const fetchTimetable = async () => {
      try {
        // const res = await api.get('/timetables/cse/5/a'); // example backend call
        const res = {
          data: [
            { id: 1, day: 'Monday', subject: 'Data Structures', time: '9:00 - 10:00 AM', faculty: 'Dr. Nisha' },
            { id: 2, day: 'Monday', subject: 'DBMS', time: '10:00 - 11:00 AM', faculty: 'Prof. Ramesh' },
            { id: 3, day: 'Tuesday', subject: 'Operating Systems', time: '9:00 - 10:00 AM', faculty: 'Dr. Anita' },
          ],
        };
        setTimetable(res.data);
      } catch (err) {
        console.error('Error loading timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading timetable...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Timetable</Text>
      <FlatList
        data={timetable}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.day}>{item.day}</Text>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.details}>
              {item.time} — {item.faculty}
            </Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  day: { fontSize: 16, fontWeight: '700', color: '#34495E' },
  subject: { fontSize: 18, fontWeight: '600', color: '#2C3E50', marginTop: 4 },
  details: { fontSize: 14, color: '#7F8C8D', marginTop: 4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
