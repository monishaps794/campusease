// src/services/socket.js
import { io } from 'socket.io-client';
import { BASE_URL } from '../constants/config';

const SOCKET_URL = BASE_URL.replace('/api', '');

let socket;

export function connectSocket(token, onConnect) {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: token ? { token } : undefined, // ✅ only send if available
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected', socket.id);
    onConnect && onConnect(socket);
  });

  socket.on('connect_error', (err) => {
    console.warn('❌ Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
