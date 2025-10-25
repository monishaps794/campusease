// src/services/api.js
import axios from 'axios';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: BASE_URL || 'http://192.168.1.100:4000/api', // change to your backend IP
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// helper to safely call backend, falling back to mocks when backend unavailable
const safe = async (fn, fallback = null) => {
  try {
    const res = await fn();
    return res.data ?? res;
  } catch (err) {
    console.warn('API error (using fallback):', err.message);
    return fallback;
  }
};

export default api;
export { safe };

