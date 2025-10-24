// src/screens/Faculty/MyBookings.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { sendLocalNotification } from '../../services/notification';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      sendLocalNotification('Booking Cancelled', 'Your booking was successfully cancelled.');
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Cancel failed:', err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading bookings...</Text>
      </View>
    );

  if (!bookings.length)
    return (
      <View style={styles.center}>
        <Text>No bookings found.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.roomName}>{item.roomId?.name || 'Unknown Room'}</Text>
            <Text>Status: {item.status}</Text>
            <Text>
              {new Date(item.startTime).toLocaleTimeString()} -{' '}
              {new Date(item.endTime).toLocaleTimeString()}
            </Text>

            {item.status !== 'cancelled' && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelBooking(item._id)}
              >
                <Text style={styles.cancelText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8ff', padding: 15 },
  title: { fontSize: 22, fontWeight: '700', color: '#2E86DE', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  roomName: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
