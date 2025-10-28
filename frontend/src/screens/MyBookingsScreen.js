// frontend/src/screens/MyBookingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import api from "../api";
import { getAuthData } from "../utils/storage";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const { user } = await getAuthData();
      const res = await api.getMyBookings(user?.email);
      if (res && res.success) setBookings(res.bookings || []);
    } catch (err) {
      console.error("fetch my bookings:", err);
      Alert.alert("Error", err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const cancel = async (id) => {
    try {
      await api.del(`/bookings/${id}`);
      Alert.alert("Cancelled");
      fetch();
    } catch (err) {
      console.error("cancel err:", err);
      Alert.alert("Error", err.message || "Failed to cancel");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex:1, padding:12 }}>
      <Text style={{ fontSize:18, fontWeight:"bold" }}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={i => i._id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text>Room: {item.roomId?.roomNumber || item.roomId}</Text>
            <Text>Date: {item.date} Slot: {item.slot}</Text>
            <Text>Status: {item.status}</Text>
            <TouchableOpacity onPress={() => cancel(item._id)} style={styles.btn}><Text style={{color:"#fff"}}>Cancel</Text></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop:20, textAlign:"center" }}>No bookings</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:"#fff", padding:12, marginVertical:8, borderRadius:8, elevation:2 },
  btn: { backgroundColor:"#e63946", padding:8, marginTop:8, alignItems:"center", borderRadius:6 }
});
