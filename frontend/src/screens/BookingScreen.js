import React, { useState, useEffect } from 'react';
import { View, Text, Button, Picker, TextInput, Alert } from 'react-native';
import api from '../api';

export default function BookingScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('A');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [forWhom, setForWhom] = useState('');
  const [reason, setReason] = useState('');
  useEffect(() => {
    (async () => {
      const res = await api.get('/faculty/classrooms');
      setRooms(res.data);
      if (res.data[0]) setRoomId(res.data[0]._id);
    })();
  }, []);
  const submit = async () => {
    if (!roomId) { Alert.alert('Select room'); return; }
    try {
      const res = await api.post('/faculty/request-booking', { classroomId: roomId, branch, year, section, startTime, endTime, forWhom, reason });
      Alert.alert('Requested', 'Booking request sent to admin');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };
  return (
    <View style={{ padding:20 }}>
      <Text>Book Classroom</Text>
      <Picker selectedValue={roomId} onValueChange={setRoomId}>
        {rooms.map(r => <Picker.Item key={r._id} label={`${r.roomNumber} (${r.block}) - ${r.status}`} value={r._id} />)}
      </Picker>
      <Text>Branch</Text>
      <Picker selectedValue={branch} onValueChange={setBranch}>
        <Picker.Item label="CSE" value="CSE" />
        <Picker.Item label="ECE" value="ECE" />
      </Picker>
      <Text>Year</Text>
      <Picker selectedValue={year} onValueChange={setYear}>
        <Picker.Item label="1" value="1" /><Picker.Item label="2" value="2" />
      </Picker>
      <Text>Section</Text>
      <Picker selectedValue={section} onValueChange={setSection}>
        <Picker.Item label="A" value="A" /><Picker.Item label="B" value="B" />
      </Picker>
      <TextInput placeholder="Start ISO datetime (e.g. 2025-10-24T09:00:00Z)" value={startTime} onChangeText={setStartTime} style={{ borderWidth:1, padding:8, marginVertical:8 }} />
      <TextInput placeholder="End ISO datetime" value={endTime} onChangeText={setEndTime} style={{ borderWidth:1, padding:8, marginVertical:8 }} />
      <TextInput placeholder="For whom" value={forWhom} onChangeText={setForWhom} style={{ borderWidth:1, padding:8, marginVertical:8 }} />
      <TextInput placeholder="Reason" value={reason} onChangeText={setReason} style={{ borderWidth:1, padding:8, marginVertical:8 }} />
      <Button title="Request Booking" onPress={submit} />
    </View>
  );
}
