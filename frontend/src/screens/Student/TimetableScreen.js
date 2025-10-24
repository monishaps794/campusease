import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Picker } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function TimetableScreen() {
  const { user } = useAuth();
  const [day, setDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get(`/timetable/${user.branch}/${user.semester}/${user.section}/${day}`);
        setClasses(res.data);
      } catch (err) {
        console.warn('API error (timetable):', err.message);
      }
    };
    fetchTimetable();
  }, [day]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.branch} {user.semester} Sem - {user.section}</Text>
      <Picker selectedValue={day} onValueChange={setDay}>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
          <Picker.Item key={d} label={d} value={d} />
        ))}
      </Picker>

      <FlatList
        data={classes}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.sub}>{item.subject}</Text>
            <Text>{item.time} - {item.faculty}</Text>
            <Text>Room: {item.room}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 20, fontWeight: '600', color: '#2E86DE', marginBottom: 10 },
  card: {
    backgroundColor: '#f2f8ff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  sub: { fontWeight: 'bold', color: '#333' },
});
