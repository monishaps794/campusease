// src/components/ReassignModal.js (new)
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api, { safe } from '../services/api';

export default function ReassignModal({ visible, onClose, timetableEntry, onAssigned }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      // backend endpoint to get available faculties at this timeslot
      const fallback = [
        { id: 'f2', name: 'Prof. Ramesh' }, { id: 'f3', name: 'Dr. Anita' }
      ];
      const res = await safe(() => api.get(`/faculty/available?date=${new Date().toISOString().slice(0,10)}&start=${timetableEntry.start}&end=${timetableEntry.end}`), fallback);
      setCandidates(res);
      setLoading(false);
    })();
  }, [visible]);

  const handleAssign = async ()=> {
    if (!selected) return;
    const payload = {
      fromFacultyId: timetableEntry.facultyId,
      toFacultyId: selected.id,
      date: new Date().toISOString().slice(0,10),
      note: `Assigned by ${timetableEntry.facultyId}`
    };
    await safe(()=>api.post(`/timetables/${timetableEntry.id}/reassign`, payload), {});
    onAssigned && onAssigned(selected);
    onClose();
  };

  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Assign replacement for {timetableEntry.subject}</Text>
          {loading ? <ActivityIndicator/> : (
            <FlatList data={candidates} keyExtractor={i=>i.id} renderItem={({item})=>(
              <TouchableOpacity style={[styles.item, selected?.id===item.id && {backgroundColor:'#2E86DE'}]} onPress={()=>setSelected(item)}>
                <Text style={{color:selected?.id===item.id?'#fff':'#000'}}>{item.name}</Text>
              </TouchableOpacity>
            )}/>
          )}
          <TouchableOpacity onPress={handleAssign} style={styles.confirm}>Confirm</TouchableOpacity>
          <TouchableOpacity onPress={onClose}><Text style={{textAlign:'center',color:'#E74C3C',marginTop:8}}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.4)'},
  box:{width:'90%',backgroundColor:'#fff',padding:14,borderRadius:10},
  title:{fontWeight:'700',marginBottom:10},
  item:{padding:10,backgroundColor:'#f1f1f1',marginBottom:8,borderRadius:8},
  confirm:{backgroundColor:'#2E86DE',padding:12,borderRadius:8,marginTop:8}
});
