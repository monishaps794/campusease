import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (err) {
    console.error('Error saving token:', err);
  }
};

// Get token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (err) {
    console.error('Error getting token:', err);
    return null;
  }
};

// Save user info
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user:', err);
  }
};

// Get user info
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('Error getting user:', err);
    return null;
  }
};

// Clear all data (logout)
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'user']);
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
};
