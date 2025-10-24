import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusEase - Student Dashboard</Text>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Timetable')}>
          <Text style={styles.icon}>📅</Text>
          <Text>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Staffrooms')}>
          <Text style={styles.icon}>🏫</Text>
          <Text>Staffrooms</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.icon}>🔔</Text>
          <Text>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E86DE', marginBottom: 20 },
  menu: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    elevation: 3,
  },
  icon: { fontSize: 32, marginBottom: 5 },
});
