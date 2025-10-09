import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function OtpScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Enter OTP');
      return;
    }
    setLoading(true);
    try {
      if (otp === '123456') {
        // 🔹 Switch roles easily for testing
        let role = 'student';
        if (email.includes('faculty')) role = 'faculty';
        else if (email.includes('admin')) role = 'admin';

        const userData = { email, role };
        login(userData);
        Alert.alert(`Login successful as ${role}!`);
      } else {
        Alert.alert('Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Error verifying OTP', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

      <TextInput
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 26, fontWeight: '700', color: '#2E86DE', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 5,
  },
  button: { backgroundColor: '#2E86DE', padding: 14, borderRadius: 10, width: '90%' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  link: { color: '#2E86DE', marginTop: 20 },
});
