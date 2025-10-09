// src/screens/Faculty/UpdateAvailability.js
import { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import api, { safe } from '../../services/api';

export default function UpdateAvailability() {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    fetchMyClasses();
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    // fetch faculty status (mock fallback)
    const fallback = { status: 'present' };
    const data = await safe(() => api.get(`/faculty/${user?.id}/availability`), fallback);
    setStatus(data.status || fallback.status);
  };

  const fetchMyClasses = async () => {
    // fetch today's classes for this faculty
    const fallback = [
      { id: 1, subject: 'Data Structures', time: '9:00 - 9:50', room: 'A-101' },
      { id: 2, subject: 'DBMS', time: '10:00 - 10:50', room: 'A-101' },
    ];
    const data = await safe(() => api.get(`/timetables/faculty/${user?.id}`), fallback);
    setMyClasses(data);
  };

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    try {
      // call backend
      await safe(() => api.patch('/faculty/availability', { facultyId: user?.id, date: new Date().toISOString().slice(0,10), status: newStatus }), {});
      setStatus(newStatus);
      Alert.alert('Updated', `Status set to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hello, {user.email}</Text>
      <Text style={styles.sub}>Current status: {status.toUpperCase()}</Text>

      <TouchableOpacity style={[styles.btn, { backgroundColor:'#27AE60' }]} onPress={() => handleUpdate('present')}>
        <Text style={styles.btnText}>Mark Present</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor:'#F39C12' }]} onPress={() => handleUpdate('not available')}>
        <Text style={styles.btnText}>Mark Not Available</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor:'#E74C3C' }]} onPress={() => handleUpdate('absent')}>
        <Text style={styles.btnText}>Mark Absent</Text>
      </TouchableOpacity>

      <Text style={{ marginTop:20, fontWeight:'700' }}>Today's Classes</Text>
      <FlatList
        data={myClasses}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor:'#fff', padding:12, marginVertical:6, borderRadius:8 }}>
            <Text style={{ fontWeight:'700' }}>{item.subject}</Text>
            <Text style={{ color:'#555' }}>{item.time} • {item.room}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:12, backgroundColor:'#F9F9F9' },
  header: { fontSize:20, fontWeight:'700', color:'#2E86DE' },
  sub: { marginTop:6, marginBottom:10 },
  btn: { padding:12, borderRadius:8, marginTop:8 },
  btnText: { color:'#fff', fontWeight:'700', textAlign:'center' }
});
