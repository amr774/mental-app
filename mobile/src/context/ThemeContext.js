import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system'); // 'light' | 'dark' | 'system'

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((saved) => {
      if (saved) setMode(saved);
    });
  }, []);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const theme = {
    isDark,
    colors: {
      ...Colors,
      background: isDark ? Colors.dark.background : Colors.background,
      surface: isDark ? Colors.dark.surface : Colors.surface,
      surfaceAlt: isDark ? Colors.dark.surfaceAlt : Colors.surfaceAlt,
      border: isDark ? Colors.dark.border : Colors.border,
      textPrimary: isDark ? Colors.dark.textPrimary : Colors.textPrimary,
      textSecondary: isDark ? Colors.dark.textSecondary : Colors.textSecondary,
      textTertiary: isDark ? Colors.dark.textTertiary : Colors.textTertiary,
    },
  };

  const setTheme = async (newMode) => {
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export default ThemeContext;
