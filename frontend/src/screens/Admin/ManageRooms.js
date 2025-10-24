// src/screens/Admin/ManageRooms.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { sendLocalNotification } from '../../services/notification';

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch rooms:', err.message);
      Alert.alert('Error', 'Could not load rooms');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (roomId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await api.patch(`/rooms/${roomId}`, { status: newStatus });
      setRooms(prev =>
        prev.map(room =>
          room._id === roomId ? { ...room, status: newStatus } : room
        )
      );
      sendLocalNotification('Room Updated', `Room marked as ${newStatus}`);
    } catch (err) {
      console.error('Update failed:', err.message);
      Alert.alert('Error', 'Failed to update room status');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E86DE" />
        <Text>Loading rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Classrooms & Labs</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text>Block: {item.block || 'N/A'}</Text>
            <Text>Capacity: {item.capacity || 'N/A'}</Text>
            <Text>Status: {item.status}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => toggleStatus(item._id, item.status)}
            >
              <Text style={styles.buttonText}>
                {item.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f8ff', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#2E86DE', marginBottom: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  roomName: { fontSize: 18, fontWeight: '600' },
  button: { backgroundColor: '#2E86DE', padding: 10, marginTop: 10, borderRadius: 6 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
