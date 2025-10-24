// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Load saved auth on app start
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@campusease_auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed.user || null);
          setToken(parsed.token || null);
          setAuthToken(parsed.token || null);
        }
      } catch (err) {
        console.warn('Failed to load saved auth', err);
      } finally {
        setLoadingAuth(false);
      }
    })();
  }, []);

  const login = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken || null);
    setAuthToken(jwtToken || null);

    try {
      await AsyncStorage.setItem('@campusease_auth', JSON.stringify({ user: userData, token: jwtToken }));
    } catch (err) {
      console.warn('Failed to persist auth', err);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      await AsyncStorage.removeItem('@campusease_auth');
    } catch (err) {
      console.warn('Failed to remove auth', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
