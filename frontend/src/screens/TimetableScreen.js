// src/screens/TimetableScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // ensure installed
import api from '../api';
import { getUser } from '../utilis/storage';

export default function TimetableScreen() {
  const [day, setDay] = useState('Monday');
  const [timetable, setTimetable] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      fetchTimetable(u, day);
    })();
  }, []);

  const fetchTimetable = async (user, selectedDay) => {
    try {
      const res = await api.get(`/timetable/${user.branch}/${user.year}/${user.section}?day=${selectedDay}`);
      setTimetable(res.data);
    } catch (err) {
      console.log('Error fetching timetable', err);
    }
  };

  const onDayChange = (d) => {
    setDay(d);
    fetchTimetable(user, d);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timetable</Text>

      <View style={styles.pickerWrapper}>
        <Picker selectedValue={day} onValueChange={onDayChange} style={styles.picker}>
          <Picker.Item label="Monday" value="Monday" />
          <Picker.Item label="Tuesday" value="Tuesday" />
          <Picker.Item label="Wednesday" value="Wednesday" />
          <Picker.Item label="Thursday" value="Thursday" />
          <Picker.Item label="Friday" value="Friday" />
          <Picker.Item label="Saturday" value="Saturday" />
        </Picker>
      </View>

      <FlatList
        data={timetable}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.time} - {item.subject} ({item.faculty})</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    ...Platform.select({
      web: { pointerEvents: 'auto', boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' },
    }),
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  pickerWrapper: {
    ...Platform.select({
      web: {
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        marginBottom: 10,
        pointerEvents: 'auto',
      },
    }),
  },
  picker: { height: 50, width: '100%' },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
