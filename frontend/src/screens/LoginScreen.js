import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const requestOtp = async () => {
    // basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    try {
      const res = await api.post('/auth/request-otp', { email });
      Alert.alert('OTP', 'If your email is valid, an OTP was sent (check spam).');
      navigation.navigate('OTPVerify', { email });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };
  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:22, marginBottom:10 }}>Campusease Login</Text>
      <TextInput placeholder="Enter email" keyboardType="email-address" autoCapitalize="none"
        value={email} onChangeText={setEmail}
        style={{ borderWidth:1, padding:8, marginBottom:12 }} />
      <Button title="Request OTP" onPress={requestOtp}/>
    </View>
  );
}
