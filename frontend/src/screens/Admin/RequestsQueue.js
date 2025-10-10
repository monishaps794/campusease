// src/screens/Admin/RequestsQueue.js (concept)
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api, { safe } from '../../services/api';

export default function RequestsQueue() {
  const [requests, setRequests] = useState([]);

  useEffect(()=>{ fetch(); },[]);

  const fetch = async ()=> {
    const data = await safe(()=>api.get('/bookings/requests?status=pending'), []);
    setRequests(data);
  };

  const approve = async (id)=> {
    await safe(()=>api.patch(`/bookings/requests/${id}/approve`), {});
    fetch();
  };

  const reject = async (id)=> {
    await safe(()=>api.patch(`/bookings/requests/${id}/reject`), {});
    fetch();
  };

  return (
    <View style={{flex:1,padding:10}}>
      <Text style={{fontWeight:'700',fontSize:18}}>Pending Booking Requests</Text>
      <FlatList data={requests} keyExtractor={i=>i.id} renderItem={({item})=>(
        <View style={styles.card}>
          <Text style={{fontWeight:'700'}}>{item.reason}</Text>
          <Text>{item.date} • {item.startTime} - {item.endTime}</Text>
          <Text>Room: {item.roomId} • By: {item.requestedByEmail || item.requestedBy}</Text>
          <View style={{flexDirection:'row',marginTop:6}}>
            <TouchableOpacity style={styles.approve} onPress={()=>approve(item.id)}><Text style={{color:'#fff'}}>Approve</Text></TouchableOpacity>
            <TouchableOpacity style={styles.reject} onPress={()=>reject(item.id)}><Text style={{color:'#fff'}}>Reject</Text></TouchableOpacity>
          </View>
        </View>
      )}/>
    </View>
  );
}

const styles = StyleSheet.create({
  card:{backgroundColor:'#fff',padding:12,borderRadius:8,marginTop:8},
  approve:{backgroundColor:'#27AE60',padding:8,borderRadius:8,marginRight:8},
  reject:{backgroundColor:'#E74C3C',padding:8,borderRadius:8}
});
