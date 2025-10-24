// src/screens/Faculty/UpdateAvailability.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { sendLocalNotification } from '../../services/notification';

export default function UpdateAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState('present');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  // ✅ Fetch available rooms and current faculty bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roomsRes = await api.get('/rooms');
        const bookingsRes = await api.get(`/faculty/bookings/${user?._id || user?.id}`);
        setRooms(roomsRes.data || []);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.warn('Error fetching faculty data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // ✅ Handle availability update
  const handleAvailability = async (status) => {
    try {
      setLoading(true);
      setAvailability(status);
      await api.post('/faculty/availability', {
        facultyId: user?._id || user?.id,
        status,
      });
      sendLocalNotification('Availability Updated', `You are marked as ${status}`);
      Alert.alert('Success', `Availability updated to "${status}"`);
    } catch (err) {
      console.error('Availability update failed:', err);
      Alert.alert('Error', 'Failed to update availability.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle room booking request
  const handleBookRoom = async (room) => {
    try {
      setLoading(true);
      const res = await api.post('/bookings/request', {
        facultyId: user?._id || user?.id,
        roomId: room._id || room.id,
        reason: 'Extra class / session booking',
      });
      setBookings((prev) => [...prev, res.data]);
      sendLocalNotification('Booking Requested', `Your booking request for ${room.name} has been sent to admin.`);
      Alert.alert('Request Sent', `Booking request for ${room.name} submitted.`);
    } catch (err) {
      console.error('Booking request failed:', err);
      Alert.alert('Error', 'Failed to send booking request.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel booking
  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      sendLocalNotification('Booking Cancelled', `Your booking request was cancelled.`);
    } catch (err) {
      console.error('Cancel booking failed:', err);
      Alert.alert('Error', 'Failed to cancel booking.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading Faculty Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Dashboard</Text>

      {/* ✅ Availability Section */}
      <Text style={styles.subtitle}>Update Availability</Text>
      <View style={styles.row}>
        {['present', 'in class', 'unavailable', 'absent'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.btn,
              availability === status && styles.activeBtn,
              loading && { opacity: 0.6 },
            ]}
            onPress={() => !loading && handleAvailability(status)}
            disabled={loading}
          >
            <Text style={styles.btnText}>{status.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ Room Booking Section */}
      <Text style={[styles.subtitle, { marginTop: 25 }]}>Book a Classroom</Text>
      {rooms.length === 0 ? (
        <Text style={styles.info}>No rooms available currently.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id || item.id}
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
      )}

      {/* ✅ Booking List Section */}
      <Text style={[styles.subtitle, { marginTop: 25 }]}>My Booking Requests</Text>
      {bookings.length === 0 ? (
        <Text style={styles.info}>No booking requests yet.</Text>
      ) : (
        bookings.map((b) => (
          <View key={b._id} style={styles.bookingCard}>
            <Text style={styles.roomName}>{b.room?.name || 'Room'}</Text>
            <Text>Status: {b.status}</Text>
            <TouchableOpacity onPress={() => handleCancelBooking(b._id)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f8ff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#2E86DE', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  btn: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    width: '22%',
    alignItems: 'center',
  },
  activeBtn: { backgroundColor: '#2E86DE' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  info: { textAlign: 'center', color: '#888', marginVertical: 5 },
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
  bookingCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelText: { color: 'red', marginTop: 5 },
});
