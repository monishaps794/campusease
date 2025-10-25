import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import api from '../api';

export default function NotificationsScreen() {
  const [notes, setNotes] = useState([]);
  useEffect(()=>{ (async ()=> {
    const res = await api.get('/common/notifications');
    setNotes(res.data);
  })(); }, []);
  return (
    <View style={{ padding:20 }}>
      <Text>Notifications</Text>
      <FlatList data={notes} keyExtractor={n=>n._id} renderItem={({item}) => (
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text style={{ fontWeight:'bold' }}>{item.title}</Text>
          <Text>{item.message}</Text>
          <Text style={{ fontSize:10 }}>{new Date(item.sentAt).toLocaleString()}</Text>
        </View>
      )}/>
    </View>
  );
}
