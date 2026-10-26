import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

const Input = forwardRef(({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon = null,
  rightIcon = null,
  editable = true,
  style,
  inputStyle,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  textAlignVertical,
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? Colors.error
    : isFocused
    ? Colors.primary
    : theme.colors.border;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: theme.colors.surface,
            borderWidth: isFocused ? 2 : 1.5,
          },
          !editable && styles.disabled,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            multiline && styles.multiline,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsSecureVisible((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.sm,
  },
  multiline: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  error: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Input;
