// src/services/socket.js
import { io } from 'socket.io-client';
import { BASE_URL } from '../constants/config';

// Derive WebSocket base URL (strip /api if present)
const SOCKET_URL =
  BASE_URL?.replace('/api', '')?.replace('https', 'wss').replace('http', 'ws') ||
  'ws://192.168.1.100:4000';

let socket = null;

/**
 * Connects to backend Socket.IO server.
 * @param {string} token  Optional JWT or session token
 * @param {function} onConnect Callback after successful connect
 */
export function connectSocket(token, onConnect) {
  try {
    // if socket already connected, reuse
    if (socket && socket.connected) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      if (onConnect) onConnect(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('❌ Socket connection error:', err.message);
    });

    return socket;
  } catch (err) {
    console.error('Socket connection failed:', err);
    return null;
  }
}

/** Returns the active socket instance */
export function getSocket() {
  return socket;
}

/** Cleanly disconnects the socket */
export function disconnectSocket() {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
}
