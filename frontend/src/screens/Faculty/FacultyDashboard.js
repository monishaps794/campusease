// src/screens/Faculty/UpdateAvailability.js
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sendLocalNotification } from '../../services/notification';

export default function UpdateAvailability() {
  const [availability, setAvailability] = useState('present');
  const [bookings, setBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = [
    { id: 'R101', name: 'Classroom 101' },
    { id: 'R102', name: 'Classroom 102' },
    { id: 'Lab201', name: 'Lab 201' },
    { id: 'Lab202', name: 'Lab 202' },
  ];

  const handleAvailability = (status) => {
    setAvailability(status);
    sendLocalNotification('Faculty Availability Updated', `You are marked as ${status}`);
  };

  const handleBookRoom = (room) => {
    const newBooking = { room, time: new Date().toLocaleTimeString(), status: 'pending' };
    setBookings([...bookings, newBooking]);
    setSelectedRoom(room);
    sendLocalNotification('Booking Requested', `Your request for ${room.name} is pending admin approval.`);
  };

  const handleCancelBooking = (roomId) => {
    const updated = bookings.filter(b => b.room.id !== roomId);
    setBookings(updated);
    sendLocalNotification('Booking Cancelled', `Your booking request was cancelled.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Dashboard</Text>

      <Text style={styles.subtitle}>Mark Your Availability</Text>
      <View style={styles.row}>
        {['present', 'absent', 'in class'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.btn, availability === status && styles.activeBtn]}
            onPress={() => handleAvailability(status)}
          >
            <Text style={styles.btnText}>{status.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.subtitle, { marginTop: 20 }]}>Book Classroom</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.roomCard}>
            <Text style={styles.roomName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleBookRoom(item)}
            >
              <Text style={styles.bookText}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={[styles.subtitle, { marginTop: 30 }]}>Your Booking Requests</Text>
      {bookings.length === 0 ? (
        <Text style={styles.info}>No current bookings</Text>
      ) : (
        bookings.map((b, i) => (
          <View key={i} style={styles.bookingCard}>
            <Text>{b.room.name}</Text>
            <Text>Status: {b.status}</Text>
            <TouchableOpacity onPress={() => handleCancelBooking(b.room.id)}>
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
  btn: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },
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
