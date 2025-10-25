import React from 'react';
import { View, Text, Button } from 'react-native';

export default function AdminHome({ navigation }) {
  return (
    <View style={{ padding:20 }}>
      <Text style={{ fontSize:20 }}>Admin Home</Text>
      <Button title="Classrooms & Labs" onPress={() => navigation.navigate('Requests')} />
      <View style={{ height:8 }}/>
      <Button title="Staffrooms" onPress={() => navigation.navigate('Staffroom')} />
      <View style={{ height:8 }}/>
      <Button title="Timetable" onPress={() => navigation.navigate('Timetable')} />
      <View style={{ height:8 }}/>
      <Button title="Booking" onPress={() => navigation.navigate('Booking')} />
      <View style={{ height:8 }}/>
      <Button title="Requests" onPress={() => navigation.navigate('Requests')} />
    </View>
  );
}
