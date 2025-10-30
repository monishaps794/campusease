// frontend/src/screens/RequestsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import api from "../api";

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getPendingRequests();
      if (res && res.success) {
        setRequests(res.requests || []);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("fetchRequests error:", err);
      Alert.alert("Error", "Failed to load pending requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const take = async (id, action) => {
    try {
      if (action === "approve") {
        await api.approveBooking(id);
        Alert.alert("Approved", "Booking approved.");
      } else {
        await api.rejectBooking(id);
        Alert.alert("Rejected", "Booking rejected.");
      }
      fetchRequests();
    } catch (err) {
      console.error("take action err:", err);
      Alert.alert("Error", "Action failed.");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{flex:1, padding:12, backgroundColor:"#fff"}}>
      <Text style={{ fontSize:18, fontWeight:"bold" }}>Pending Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={i => i._id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={{fontWeight:"600"}}>Room: {item.roomId?.roomNumber || item.roomId || "-"}</Text>
            <Text>Date: {item.date}  Slot: {item.slot}</Text>
            <Text>By: {item.requestedBy}</Text>
            <View style={{flexDirection:"row", marginTop:8}}>
              <TouchableOpacity style={[styles.btn, {backgroundColor:"#28a745"}]} onPress={()=>take(item._id,"approve")}>
                <Text style={{color:"#fff"}}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, {backgroundColor:"#e63946", marginLeft:8}]} onPress={()=>take(item._id,"reject")}>
                <Text style={{color:"#fff"}}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign:"center", marginTop:20}}>No pending requests</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:"#fff", padding:12, marginVertical:8, borderRadius:8, elevation:2 },
  btn: { padding:8, borderRadius:6 }
});
