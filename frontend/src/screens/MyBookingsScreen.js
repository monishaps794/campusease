import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import api from '../api';

export default function MyBookingsScreen() {
  const [list, setList] = useState([]);
  useEffect(()=> fetch(), []);
  const fetch = async () => {
    const res = await api.get('/faculty/my-bookings');
    setList(res.data);
  };
  const cancel = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      Alert.alert('Cancelled');
      fetch();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };
  return (
    <View style={{ padding:20 }}>
      <Text>My Bookings</Text>
      <FlatList data={list} keyExtractor={i=>i._id} renderItem={({item}) => (
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text>{item.classroomSnapshot.roomNumber} - {item.status}</Text>
          <Text>{item.branch}-{item.year}-{item.section}</Text>
          <Text>{new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}</Text>
          {item.status === 'pending' && <Button title="Cancel" onPress={()=>cancel(item._id)} />}
        </View>
      )}/>
    </View>
  );
}
