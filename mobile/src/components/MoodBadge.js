import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMoodByValue } from '../utils/helpers';
import { Typography, Spacing, BorderRadius } from '../theme';

const MoodBadge = ({ value, showLabel = false, size = 'md' }) => {
  const mood = getMoodByValue(value);
  const emojiSizes = { sm: 18, md: 24, lg: 32 };
  const labelSizes = { sm: Typography.fontSize.xs, md: Typography.fontSize.sm, lg: Typography.fontSize.base };

  return (
    <View style={[styles.container, { backgroundColor: mood.color + '25' }]}>
      <Text style={{ fontSize: emojiSizes[size] }}>{mood.emoji}</Text>
      {showLabel && (
        <Text
          style={[styles.label, { color: mood.color, fontSize: labelSizes[size] }]}
        >
          {mood.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  label: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default MoodBadge;
