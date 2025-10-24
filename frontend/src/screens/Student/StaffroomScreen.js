import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import api from '../../services/api';

export default function StaffroomScreen() {
  const [staffrooms, setStaffrooms] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/staffrooms')
      .then(res => setStaffrooms(res.data))
      .catch(err => console.warn('Error fetching staffrooms:', err.message));
  }, []);

  return (
    <View style={styles.container}>
      {selected ? (
        <>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selected.name}</Text>
          <FlatList
            data={selected.faculties}
            keyExtractor={(f, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>Status: {item.status}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Staffrooms</Text>
          <FlatList
            data={staffrooms}
            keyExtractor={(s, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelected(item)} style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{item.faculties.length} Faculties</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E86DE', marginBottom: 10 },
  card: {
    backgroundColor: '#f4f7ff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
  name: { fontSize: 16, fontWeight: '600' },
  back: { color: '#2E86DE', marginBottom: 10 },
});
