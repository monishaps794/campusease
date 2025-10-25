// src/components/BookingModal.js
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import api, { safe } from '../services/api';
import { sendLocalNotification } from '../services/notification';

export default function BookingModal({ visible, onClose, room, onBooked }) {
  const { user } = useContext(AuthContext);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const slots = [
    '08:30 - 09:30',
    '09:30 - 10:30',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  useEffect(() => {
    setSelectedSlot(null);
    setExistingBooking(null);
    if (visible) checkExisting();
  }, [visible]);

  const checkExisting = async () => {
    // fetch today's bookings for this room by this user (mockable)
    const fallback = []; // mock empty
    const data = await safe(() => api.get(`/bookings?roomId=${room._id}`), fallback);
    // find booking by this user
    const myBooking = Array.isArray(data) ? data.find(b => String(b.userId) === String(user?.id)) : null;
    setExistingBooking(myBooking || null);
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert('Please select a time slot');
      return;
    }
    setLoading(true);
    try {
      // call backend (replace with real endpoint)
      const payload = {
  roomId: room._id || room.id,
  requestedBy: user?.id || user?.email,
  date: new Date().toISOString().slice(0,10),
  startTime: selectedSlot.split(' - ')[0], // or proper format
  endTime: selectedSlot.split(' - ')[1],
  reason: `Extra class by ${user.email}`,
  forSection: { branch: user.branch || 'ISE', semester: user.semester || '5', section: user.section || 'A' }
};
      const res = await safe(() => api.post('/bookings/requests', payload), { id: 'mock-req', ...payload, status:'pending' });
      await sendLocalNotification('Room booked', `${room.name} booked for ${selectedSlot}`);
      Alert.alert('Booked', `${room.name} booked for ${selectedSlot}`);
      onBooked && onBooked(res);
      onClose();
    } catch (err) {
      Alert.alert('Booking failed', err.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!existingBooking) {
      Alert.alert('No booking found to cancel');
      return;
    }
    setLoading(true);
    try {
      await safe(() => api.delete(`/bookings/${existingBooking._id}`), {});
      await sendLocalNotification('Booking cancelled', `${room.name} booking cancelled`);
      Alert.alert('Cancelled', 'Booking cancelled successfully');
      onBooked && onBooked(null);
      onClose();
    } catch (err) {
      Alert.alert('Cancel failed', err.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Book — {room?.name}</Text>
          <Text style={{ marginBottom: 8, color: '#555' }}>Select a time slot</Text>

          <FlatList
            data={slots}
            keyExtractor={(i) => i}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.slot, selectedSlot === item && styles.slotSelected]}
                onPress={() => setSelectedSlot(item)}
              >
                <Text style={[styles.slotText, selectedSlot === item && { color: '#fff' }]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 10 }}
          />

          {loading ? <ActivityIndicator /> : null}

          <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={loading}>
            <Text style={styles.bookText}>Confirm Booking</Text>
          </TouchableOpacity>

          {existingBooking && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={loading}>
              <Text style={styles.cancelText}>Cancel My Booking</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.4)' },
  box: { width:'90%', backgroundColor:'#fff', borderRadius:12, padding:16, maxHeight:'80%' },
  title: { fontSize:18, fontWeight:'700', color:'#2E86DE', marginBottom:6 },
  slot: { padding:10, borderRadius:8, backgroundColor:'#f1f1f1', marginBottom:8 },
  slotSelected: { backgroundColor:'#2E86DE' },
  slotText: { fontWeight:'600' },
  bookBtn: { backgroundColor:'#2E86DE', padding:12, borderRadius:8, marginTop:8 },
  bookText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  cancelBtn: { backgroundColor:'#E74C3C', padding:12, borderRadius:8, marginTop:8 },
  cancelText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  close: { marginTop:10, textAlign:'center', color:'#2E86DE' },
});
