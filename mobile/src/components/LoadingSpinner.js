import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({
  fullScreen = false,
  message,
  size = 'large',
  color = Colors.primary,
}) => {
  const { theme } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size={size} color={color} />
        {message ? (
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    paddingVertical: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
