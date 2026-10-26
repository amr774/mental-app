import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',          // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon = null,          // React element
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BorderRadius.sm },
    md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: BorderRadius.md },
    lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: BorderRadius.lg },
  };

  const textSizes = {
    sm: Typography.fontSize.sm,
    md: Typography.fontSize.base,
    lg: Typography.fontSize.lg,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#A0AEC0', '#718096'] : [Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyles[size], Shadows.teal]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <View style={styles.row}>
              {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
              <Text style={[styles.primaryText, { fontSize: textSizes[size] }, textStyle]}>
                {title}
              </Text>
              {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: {
      container: { backgroundColor: Colors.secondary, ...Shadows.sm },
      text: { color: Colors.white },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
      },
      text: { color: Colors.primary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: Colors.primary },
    },
    danger: {
      container: { backgroundColor: Colors.error, ...Shadows.sm },
      text: { color: Colors.white },
    },
  };

  const vs = variantStyles[variant] || variantStyles.outline;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        sizeStyles[size],
        vs.container,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text.color} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.baseText, { fontSize: textSizes[size] }, vs.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
  primaryText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  baseText: {
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
