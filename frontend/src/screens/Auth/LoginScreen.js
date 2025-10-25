import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) {
      Alert.alert('Enter email');
      return;
    }
    setLoading(true);
    try {
      // 🔹 call backend later: await api.post('/auth/request-otp', { email });
      console.log(`OTP requested for ${email}`);
      Alert.alert('OTP sent!', 'Use 123456 as mock OTP');
      navigation.navigate('Otp', { email });
    } catch (err) {
      Alert.alert('Error requesting OTP', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CampusEase</Text>
      <Text style={styles.subtitle}>Login with your registered email</Text>

      <TextInput
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 28, fontWeight: '700', color: '#2E86DE', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 20 },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: { backgroundColor: '#2E86DE', padding: 14, borderRadius: 10, width: '90%' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
});
