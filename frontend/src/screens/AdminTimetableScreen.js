// frontend/src/screens/AdminTimetableScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert } from "react-native";
import api from "../api";

const BRANCHES = ["ISE"]; // extend later
const SECTIONS = ["3A","3B","3C","5A","5B","5C","7A","7B","7C"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function AdminTimetableScreen() {
  const [branch, setBranch] = useState("ISE");
  const [section, setSection] = useState("3A");
  const [day, setDay] = useState("Monday");
  const [year, setYear] = useState("3"); // derived from section (3,5,7)
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // derive year from section first char
    if (section && section.length) {
      setYear(section.charAt(0));
    }
    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, section, day]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const sectionLetter = section.slice(1); // "A"/"B"
      const yearNum = section.charAt(0); // "3"/"5"/"7"
      const res = await api.getTimetable(branch, yearNum, sectionLetter, day);
      if (res && res.success) {
        setSlots(res.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Timetable fetch error:", err);
      Alert.alert("Error", "Failed to fetch timetable.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.time}>{item.time}</Text>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.faculty}>{item.faculty}</Text>
      <Text style={styles.room}>{item.classroom || "-"}</Text>
      <Text style={styles.type}>{item.type}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timetable Viewer (Admin)</Text>

      <View style={styles.row}>
        {BRANCHES.map(b => (
          <TouchableOpacity key={b} style={[styles.pill, branch === b && styles.pillSelected]} onPress={() => setBranch(b)}>
            <Text style={branch===b?styles.pillTextSelected:styles.pillText}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        {SECTIONS.map(s => (
          <TouchableOpacity key={s} style={[styles.pill, section===s && styles.pillSelected]} onPress={()=>setSection(s)}>
            <Text style={section===s?styles.pillTextSelected:styles.pillText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        {DAYS.map(d => (
          <TouchableOpacity key={d} style={[styles.pill, day===d && styles.pillSelected]} onPress={()=>setDay(d)}>
            <Text style={day===d?styles.pillTextSelected:styles.pillText}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <FlatList
          data={slots}
          keyExtractor={(it, idx) => String(idx)}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No classes for selected day</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:12,backgroundColor:"#fff"},
  title:{fontSize:20,fontWeight:"bold",textAlign:"center",marginBottom:10},
  row:{flexDirection:"row",flexWrap:"wrap",marginBottom:8},
  pill:{borderWidth:1,borderColor:"#ddd",padding:8, borderRadius:8, marginRight:8, marginBottom:6},
  pillSelected:{backgroundColor:"#007AFF",borderColor:"#007AFF"},
  pillText:{color:"#333"},
  pillTextSelected:{color:"#fff"},
  card:{backgroundColor:"#f7f9fb",padding:12, borderRadius:8, marginVertical:6},
  time:{fontWeight:"bold"},
  subject:{fontSize:16,fontWeight:"600"},
  faculty:{color:"#333"},
  room:{color:"#666"},
  type:{fontStyle:"italic",color:"#444"}
});
