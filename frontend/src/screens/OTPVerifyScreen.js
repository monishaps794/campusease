// src/screens/OTPVerifyScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Platform } from 'react-native';
import axios from 'axios';
import { saveToken, saveUser } from '../utilis/storage';

export default function OTPVerifyScreen({ route, navigation }) {
  const email = route.params?.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    try {
      setLoading(true);

      // ✅ Make POST request using axios
      const response = await axios.post('http://172.16.12.53:5000/auth/verify-otp', {
        email,
        code: otp,
      });

      const { token, user } = response.data;

      if (token && user) {
        // ✅ Save token and user in local storage
        await saveToken(token);
        await saveUser(user);

        Alert.alert('Success', 'OTP Verified Successfully');

        // ✅ Navigate user based on their role
        if (user.role === 'student') navigation.replace('StudentSelect');
        else if (user.role === 'faculty') navigation.replace('FacultyHome');
        else if (user.role === 'admin') navigation.replace('AdminHome');
        else navigation.replace('Login');
      } else {
        Alert.alert('Error', 'Invalid server response');
      }
    } catch (error) {
      console.error('❌ OTP Verify Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP sent to {email}</Text>
      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.buttonWrapper}>
        <Button title={loading ? 'Verifying...' : 'Verify OTP'} onPress={verifyOtp} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff', 
    justifyContent: 'center',
    ...Platform.select({
      web: {
        pointerEvents: 'auto',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
      },
    }),
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    ...Platform.select({
      web: { pointerEvents: 'auto' },
    }),
  },
  buttonWrapper: {
    ...Platform.select({
      web: { pointerEvents: 'auto' },
    }),
  },
});
