// src/screens/StudentSelectScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getUser, saveUser } from '../utilis/storage';
import api from '../api';

export default function StudentSelectScreen({ navigation }) {
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('1');
  const [section, setSection] = useState('A');
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
    })();
  }, []);

  const saveSelection = async () => {
    if (!branch || !year || !section) {
      Alert.alert('Error', 'Please select all fields');
      return;
    }
    const updatedUser = { ...user, branch, year, section };
    await saveUser(updatedUser);
    Alert.alert('Saved');
    navigation.navigate('StudentHome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Section Details</Text>

      <Text>Branch:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={branch}
          onValueChange={setBranch}
          style={styles.picker}
        >
          <Picker.Item label="CSE" value="CSE" />
          <Picker.Item label="ECE" value="ECE" />
          <Picker.Item label="ME" value="ME" />
        </Picker>
      </View>

      <Text>Year:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={year}
          onValueChange={setYear}
          style={styles.picker}
        >
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
        </Picker>
      </View>

      <Text>Section:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={section}
          onValueChange={setSection}
          style={styles.picker}
        >
          <Picker.Item label="A" value="A" />
          <Picker.Item label="B" value="B" />
          <Picker.Item label="C" value="C" />
        </Picker>
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Save & Continue" onPress={saveSelection} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
        pointerEvents: 'auto', // fixes web pointerEvents warning
      }
    })
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  pickerWrapper: {
    ...Platform.select({
      web: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        marginBottom: 10,
        pointerEvents: 'auto' // fix web pointerEvents warning
      },
    }),
  },
  picker: { height: 50, width: '100%' },
  buttonWrapper: {
    marginTop: 15,
    ...Platform.select({
      web: { pointerEvents: 'auto' }, // fix web pointerEvents warning
    }),
  },
});
