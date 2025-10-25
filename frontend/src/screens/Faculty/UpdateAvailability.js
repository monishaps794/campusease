// src/screens/Faculty/UpdateAvailability.js
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import { sendLocalNotification } from '../../services/notification';

export default function UpdateAvailability() {
  const [availability, setAvailability] = useState('present');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Fetch classroom list
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data || []);
      } catch (err) {
        console.warn('API error (using fallback):', err.message || err);
        // fallback rooms if backend not ready
        setRooms([
          { _id: 'R101', name: 'Classroom 101' },
          { _id: 'R102', name: 'Classroom 102' },
          { _id: 'Lab201', name: 'Lab 201' },
          { _id: 'Lab202', name: 'Lab 202' },
        ]);
      }
    })();
  }, []);

  const handleAvailability = (status) => {
    setAvailability(status);
    sendLocalNotification('Availability Updated', `You are marked as ${status}`);
  };

  const handleBookRoom = async (room) => {
    try {
      // call backend booking endpoint later
      const booking = {
        room,
        time: new Date().toLocaleTimeString(),
        status: 'pending',
      };
      setBookings([...bookings, booking]);
      sendLocalNotification('Booking Requested', `Request for ${room.name} sent to admin`);
    } catch (err) {
      Alert.alert('Booking failed', err.message);
    }
  };

  const handleCancelBooking = (roomId) => {
    const updated = bookings.filter(b => b.room._id !== roomId);
    setBookings(updated);
    sendLocalNotification('Booking Cancelled', `Your request was cancelled.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Dashboard</Text>

      <Text style={styles.subtitle}>Mark Your Availability</Text>
      <View style={styles.row}>
        {['present', 'in class', 'absent'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.btn, availability === status && styles.activeBtn]}
            onPress={() => handleAvailability(status)}
          >
            <Text style={styles.btnText}>{status.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.subtitle, { marginTop: 25 }]}>Book a Classroom</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.roomCard}>
            <Text style={styles.roomName}>{item.name}</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={() => handleBookRoom(item)}>
              <Text style={styles.bookText}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={[styles.subtitle, { marginTop: 25 }]}>My Booking Requests</Text>
      {bookings.length === 0 ? (
        <Text style={styles.info}>No bookings yet</Text>
      ) : (
        bookings.map((b, i) => (
          <View key={i} style={styles.bookingCard}>
            <Text>{b.room.name}</Text>
            <Text>Status: {b.status}</Text>
            <TouchableOpacity onPress={() => handleCancelBooking(b.room._id)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8ff', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#2E86DE', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  btn: { backgroundColor: '#ddd', padding: 10, borderRadius: 8, width: '30%', alignItems: 'center' },
  activeBtn: { backgroundColor: '#2E86DE' },
  btnText: { color: '#fff', fontWeight: '600' },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  roomName: { fontSize: 16, fontWeight: '500' },
  bookBtn: { backgroundColor: '#2E86DE', padding: 8, borderRadius: 6 },
  bookText: { color: '#fff' },
  info: { textAlign: 'center', color: '#888' },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelText: { color: 'red', marginTop: 5 },
});
