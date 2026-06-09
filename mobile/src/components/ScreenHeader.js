import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Colors, Typography, Spacing, Shadows } from '../theme';

const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  rightAction = null, // { icon, onPress } | React element
  transparent = false,
  large = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        !transparent && {
          backgroundColor: theme.colors.surface,
          ...Shadows.sm,
        },
        { paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 0) },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: theme.colors.surfaceAlt }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.titleSection}>
          <Text
            style={[
              large ? styles.largeTitle : styles.title,
              { color: theme.colors.textPrimary },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {rightAction ? (
            React.isValidElement(rightAction) ? (
              rightAction
            ) : (
              <TouchableOpacity
                onPress={rightAction.onPress}
                style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Ionicons
                  name={rightAction.icon}
                  size={22}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.actionBtn} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  largeTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenHeader;
