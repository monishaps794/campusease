// src/screens/Student/StaffroomScreen.js
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import api, { safe } from '../../services/api';

export default function StaffroomScreen() {
  const [staffrooms, setStaffrooms] = useState([]);

  useEffect(() => {
    (async () => {
      const fallback = [
        { id: 'sr1', name: 'Staffroom A', faculties: [{ id:'f1', name:'Dr. Nisha', status:'present' }, { id:'f2', name:'Prof. Ramesh', status:'not available' }] },
        { id: 'sr2', name: 'Staffroom B', faculties: [{ id:'f3', name:'Dr. Anita', status:'present' }] },
      ];
      const res = await safe(() => api.get('/staffrooms'), fallback);
      setStaffrooms(res);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Staffrooms & Faculty</Text>
      <FlatList
        data={staffrooms}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.faculties?.map(f => (
              <View key={f.id} style={styles.facRow}>
                <Text style={{ fontWeight:'600' }}>{f.name}</Text>
                <Text style={{ color: f.status === 'present' ? '#27AE60' : '#E67E22' }}>{f.status}</Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:10, backgroundColor:'#F9F9F9' },
  header: { textAlign:'center', fontWeight:'700', marginBottom:10, color:'#2E86DE' },
  card: { backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:8 },
  name: { fontWeight:'700', marginBottom:6 },
  facRow: { flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:0.3, borderBottomColor:'#eee' }
});
