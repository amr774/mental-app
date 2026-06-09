import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored session

  // On mount: restore session from AsyncStorage
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [storedToken, storedUser] = await AsyncStorage.multiGet([
        'authToken',
        'userData',
      ]);
      const t = storedToken[1];
      const u = storedUser[1];
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
    } catch (_) {
      // Corrupted storage — start fresh
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { token: newToken, user: newUser } = response.data;
    await AsyncStorage.multiSet([
      ['authToken', newToken],
      ['userData', JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name, email, password) => {
    const response = await authService.register({ name, email, password });
    const { token: newToken, user: newUser } = response.data;
    await AsyncStorage.multiSet([
      ['authToken', newToken],
      ['userData', JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const response = await userService.getProfile();
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (_) {
      // If profile fetch fails it usually means token expired → logout handled by interceptor
    }
  };

  const updateUserLocally = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      AsyncStorage.setItem('userData', JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        updateUserLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
