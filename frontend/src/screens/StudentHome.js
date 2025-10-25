// src/screens/StudentHome.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { getUser } from '../utilis/storage';

export default function StudentHome({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Home</Text>
      <Text style={styles.name}>Name: {user?.name || user?.email}</Text>

      <View style={styles.buttonWrapper}>
        <Button title="Time Table" onPress={() => navigation.navigate('Timetable')} />
        <View style={{ height: 10 }} />
        <Button title="Staff Rooms" onPress={() => navigation.navigate('StaffRooms')} />
        <View style={{ height: 10 }} />
        <Button title="Notifications" onPress={() => navigation.navigate('Notifications')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 3px rgba(0,0,0,0.2)', // replaces deprecated shadow props
        pointerEvents: 'auto', // replaces deprecated props.pointerEvents
      }
    })
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  name: { marginTop: 8, fontSize: 16 },
  buttonWrapper: {
    marginTop: 15,
    ...Platform.select({
      web: { pointerEvents: 'auto' }, // ensures web buttons don't throw pointerEvents warnings
    })
  }
});
