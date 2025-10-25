import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import api from '../api';

export default function RequestsScreen() {
  const [reqs, setReqs] = useState([]);
  useEffect(()=> fetch(), []);
  const fetch = async () => {
    const res = await api.get('/admin/requests');
    setReqs(res.data);
  };
  const approve = async (id) => {
    await api.put(`/admin/requests/${id}/approve`);
    fetch();
  };
  return (
    <View style={{ padding:20 }}>
      <Text>Requests</Text>
      <FlatList data={reqs} keyExtractor={r=>r._id} renderItem={({item})=>(
        <View style={{ padding:8, borderBottomWidth:1 }}>
          <Text>Type: {item.type}</Text>
          <Text>Requester: {item.requesterEmail}</Text>
          <Text>Status: {item.status}</Text>
          <Button title="Approve" onPress={()=>approve(item._id)} />
        </View>
      )}/>
    </View>
  );
}
