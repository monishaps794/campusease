import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.16.12.53:5000'; // replace with backend host e.g. 10.0.2.2 for Android emulator or localhost for web

const instance = axios.create({ baseURL: BASE_URL, timeout: 15000 });

instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
