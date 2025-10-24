// src/services/api.js
import axios from 'axios';
import { BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Helper to set auth token after login
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
