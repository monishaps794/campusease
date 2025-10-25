// src/screens/FacultyHome.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Alert, 
  Platform, 
  StyleSheet 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api';
import { getUser, saveUser } from '../utilis/storage';

export default function FacultyHome({ navigation }) {
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState('present');

  // Load user on mount
  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      setAvailability(u?.availability || 'present');
    })();
  }, []);

  // Update availability
  const update = async (val) => {
    try {
      const res = await api.put('/faculty/availability', { availability: val });
      await saveUser(res.data);
      setAvailability(res.data.availability);
      Alert.alert('Success', 'Availability updated');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Home</Text>
      <Text style={styles.name}>Name: {user?.name || user?.email}</Text>

      <Text style={{ marginTop: 10 }}>Availability:</Text>
      <View style={[styles.pickerWrapper, { pointerEvents: 'auto' }]}>
        <Picker
          selectedValue={availability}
          onValueChange={update}
          style={styles.picker}
        >
          <Picker.Item label="Present" value="present" />
          <Picker.Item label="In Class" value="in_class" />
          <Picker.Item label="Unavailable" value="unavailable" />
          <Picker.Item label="Absent" value="absent" />
        </Picker>
      </View>

      <View style={{ marginTop: 15 }}>
        <Button 
          title="Timetable" 
          onPress={() => navigation.navigate('Timetable')} 
        />
        <View style={{ height: 10 }} />
        <Button 
          title="Book a Classroom" 
          onPress={() => navigation.navigate('Booking')} 
        />
        <View style={{ height: 10 }} />
        <Button 
          title="My Bookings" 
          onPress={() => navigation.navigate('MyBookings')} 
        />
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  name: {
    marginTop: 8,
    fontSize: 16,
  },
  pickerWrapper: {
    ...Platform.select({
      web: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        // boxShadow replaces shadow props for web
        boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
      },
      ios: {},
      android: {},
    }),
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
