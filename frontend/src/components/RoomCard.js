// src/components/RoomCard.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RoomCard({ room, onBookPress, canBook }) {
  const statusColor = {
    running: '#27AE60',
    empty: '#F39C12',
    booked: '#E74C3C',
  }[room.status] || '#BDC3C7';

  return (
    <View style={styles.card}>
      <View style={{flex:1}}>
        <Text style={styles.name}>{room.name}</Text>
        <Text style={styles.details}>Type: {room.type}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          Status: {room.status ? room.status.toUpperCase() : 'UNKNOWN'}
        </Text>
      </View>

      {canBook ? (
        <TouchableOpacity style={styles.btn} onPress={onBookPress}>
          <Text style={styles.btnText}>Book</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: { fontSize: 18, fontWeight: '700', color: '#2E86DE' },
  details: { fontSize: 14, color: '#555' },
  status: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  btn: {
    backgroundColor: '#2E86DE',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 12
  },
  btnText: { color: '#fff', fontWeight: '600' }
});
