import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  const fetchSession = useCallback(async () => {
    try {
      const data = await api.get('/auth/session');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = useCallback(async (credentials) => {
    setError('');
    const data = await api.post('/login', credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setError('');
    await api.post('/register', payload);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/logout');
    setUser(null);
  }, []);

  const value = {
    user,
    initializing,
    error,
    login,
    logout,
    register,
    refreshSession: fetchSession,
    setAuthError: setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};







