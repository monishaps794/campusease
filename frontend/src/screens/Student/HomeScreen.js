// src/screens/Student/HomeScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import BookingModal from '../../components/BookingModal';
import RoomCard from '../../components/RoomCard';
import { AuthContext } from '../../contexts/AuthContext';
import api, { safe } from '../../services/api';
import { sendLocalNotification } from '../../services/notification';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const [branch, setBranch] = useState('ISE');
  const [semester, setSemester] = useState('5');
  const [section, setSection] = useState('A');
  const [rooms, setRooms] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const STORAGE_KEY = '@campusease_student_profile';

  useEffect(() => {
    (async () => {
      // load saved profile (branch/semester/section)
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setBranch(parsed.branch || 'ISE');
          setSemester(parsed.semester || '5');
          setSection(parsed.section || 'A');
        }
      } catch (e) { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    // save selection and fetch data for that section
    (async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ branch, semester, section }));
      await fetchSectionData();
    })();
  }, [branch, semester, section]);

  const fetchSectionData = async () => {
    // fetch rooms, timetable and faculty availability for the selected branch/sem/section
    // using safe() to fallback to mock data
    const roomsFallback = [
      { _id: 'r1', name: 'A-101', type: 'classroom', status: 'running' },
      { _id: 'r2', name: 'B-203', type: 'classroom', status: 'empty' },
      { _id: 'r3', name: 'L301', type: 'lab', status: 'empty' },
    ];
    const ttFallback = [
      { id: 1, period: '9:00-9:50', subject: 'Data Structures', faculty: 'Dr. Nisha', room: 'A-101' },
      { id: 2, period: '10:00-10:50', subject: 'DBMS', faculty: 'Prof. Ramesh', room: 'A-101' },
    ];
    const facFallback = [
      { id: 'f1', name: 'Dr. Nisha', staffroom: 'SR-1', status: 'present' },
      { id: 'f2', name: 'Prof. Ramesh', staffroom: 'SR-2', status: 'not available' },
    ];

    const r = await safe(() => api.get(`/rooms`), roomsFallback);
    const tt = await safe(() => api.get(`/timetables/${branch}/${semester}/${section}`), ttFallback);
    const fac = await safe(() => api.get(`/faculty/availability?branch=${branch}&semester=${semester}&section=${section}`), facFallback);

    setRooms(r);
    setTimetable(tt);
    setFacultyList(fac);
  };

  const handleBookPress = (room) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const onBooked = async (res) => {
    // refresh rooms or bookings after booking made
    // show notification to students in that section (mock local)
    await sendLocalNotification('New Extra Class', `${selectedRoom.name} has an extra class.`);
    fetchSectionData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CampusEase — {branch} • Sem {semester} • Sec {section}</Text>

      <View style={styles.filters}>
        <Picker selectedValue={branch} style={styles.picker} onValueChange={setBranch}>
          <Picker.Item label="ISE" value="ISE" />
          <Picker.Item label="CSE" value="CSE" />
          <Picker.Item label="ECE" value="ECE" />
          <Picker.Item label="EEE" value="EEE" />
        </Picker>

        <Picker selectedValue={semester} style={styles.picker} onValueChange={setSemester}>
          <Picker.Item label="1st" value="1" />
          <Picker.Item label="3rd" value="3" />
          <Picker.Item label="5th" value="5" />
          <Picker.Item label="7th" value="7" />
        </Picker>

        <Picker selectedValue={section} style={styles.picker} onValueChange={setSection}>
          <Picker.Item label="A" value="A" />
          <Picker.Item label="B" value="B" />
          <Picker.Item label="C" value="C" />
          <Picker.Item label="D" value="D" />
        </Picker>
      </View>

      <Text style={styles.subHeader}>Today's Timetable</Text>
      <FlatList
        data={timetable}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.ttCard}>
            <Text style={styles.ttSubject}>{item.subject}</Text>
            <Text style={styles.ttDetails}>{item.period} • {item.faculty} • {item.room}</Text>
          </View>
        )}
      />

      <Text style={styles.subHeader}>Rooms</Text>
      <FlatList
        data={rooms}
        keyExtractor={(i) => i._id || i.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onBookPress={() => handleBookPress(item)}
            canBook={user?.role === 'faculty' || user?.role === 'admin'}
          />
        )}
      />

      <Text style={styles.subHeader}>Faculty for this Section</Text>
      <FlatList
        data={facultyList}
        keyExtractor={(i) => i.id || i._id}
        renderItem={({ item }) => (
          <View style={styles.facCard}>
            <Text style={{ fontWeight:'700' }}>{item.name}</Text>
            <Text style={{ color:'#555' }}>{item.staffroom} • {item.status}</Text>
          </View>
        )}
      />

      {selectedRoom && (
        <BookingModal visible={modalVisible} onClose={() => setModalVisible(false)} room={selectedRoom} onBooked={onBooked} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:10, backgroundColor:'#F9F9F9' },
  header: { textAlign:'center', fontSize:18, fontWeight:'700', color:'#2E86DE', marginBottom:8 },
  filters: { flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  picker: { flex:1, height:40 },
  subHeader: { marginTop:10, marginBottom:6, fontSize:16, fontWeight:'700', color:'#34495E' },
  ttCard: { backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:8 },
  ttSubject: { fontWeight:'700' },
  ttDetails: { color:'#555', marginTop:4 },
  facCard: { backgroundColor:'#fff', padding:10, borderRadius:8, marginBottom:8 }
});
