import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import api from '../api';

export default function StaffroomScreen() {
  const [rooms, setRooms] = useState([]);
  useEffect(() => { (async ()=> {
    try {
      const res = await api.get('/common/staffrooms');
      setRooms(res.data);
    } catch (err) { console.log(err); }
  })(); }, []);
  return (
    <View style={{ padding:20 }}>
      <Text>Staffrooms</Text>
      <FlatList data={rooms} keyExtractor={r=>r._id} renderItem={({item})=>(
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text style={{ fontWeight:'bold' }}>{item.name} ({item.block})</Text>
          {item.faculties && item.faculties.map(f => (
            <Text key={f.email}>{f.name || f.email} - {f.availability || 'present'}</Text>
          ))}
        </View>
      )}/>
    </View>
  );
}
