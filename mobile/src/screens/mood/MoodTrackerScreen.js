import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { moodService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { MOOD_OPTIONS } from '../../utils/helpers';

const MoodTrackerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMoodSelect = (mood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMood(mood);
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Select a Mood', 'Please choose how you are feeling before submitting.');
      return;
    }
    setLoading(true);
    try {
      await moodService.logMood({ value: selectedMood.value, note });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to log mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.successContainer}>
          <View style={[styles.successEmoji, { backgroundColor: selectedMood.color + '20' }]}>
            <Text style={styles.successEmojiText}>{selectedMood.emoji}</Text>
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>
            Mood logged! 🎉
          </Text>
          <Text style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}>
            You're feeling{' '}
            <Text style={{ color: selectedMood.color, fontWeight: '700' }}>
              {selectedMood.label}
            </Text>{' '}
            today. Remember, every feeling is valid.
          </Text>
          <Button
            title="View History"
            onPress={() => navigation.navigate('MoodHistory')}
            style={styles.successBtn}
          />
          <Button
            title="Log Another"
            onPress={() => { setSubmitted(false); setSelectedMood(null); setNote(''); }}
            variant="outline"
            style={styles.successBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={
            selectedMood
              ? [selectedMood.color, selectedMood.color + 'CC']
              : [Colors.primary, Colors.secondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('mood')}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MoodHistory')}
              style={styles.historyBtn}
            >
              <Ionicons name="time-outline" size={22} color={Colors.white} />
              <Text style={styles.historyBtnText}>History</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerQuestion}>{t('howFeeling')}</Text>
          {selectedMood && (
            <Text style={styles.selectedEmoji}>{selectedMood.emoji}</Text>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Mood Selector */}
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            Tap to select your mood
          </Text>
          <View style={styles.moodsGrid}>
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood?.value === mood.value;
              return (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => handleMoodSelect(mood)}
                  activeOpacity={0.85}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor: isSelected ? mood.color + '20' : theme.colors.surface,
                      borderColor: isSelected ? mood.color : theme.colors.border,
                      borderWidth: isSelected ? 2.5 : 1.5,
                      ...Shadows.sm,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color: isSelected ? mood.color : theme.colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {t(mood.label)}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: mood.color }]}>
                      <Ionicons name="checkmark" size={12} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note Input */}
          <View style={styles.noteSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              {t('addNote')}
            </Text>
            <View
              style={[
                styles.noteInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  ...Shadows.sm,
                },
              ]}
            >
              <TextInput
                style={[styles.noteText, { color: theme.colors.textPrimary }]}
                placeholder="What's on your mind today?"
                placeholderTextColor={theme.colors.textTertiary}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>
                {note.length}/500
              </Text>
            </View>
          </View>

          <Button
            title={loading ? 'Saving...' : t('logMood')}
            onPress={handleSubmit}
            loading={loading}
            disabled={!selectedMood}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    minHeight: 160,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  historyBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  headerQuestion: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  selectedEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  content: { padding: Spacing.base },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  moodOption: {
    width: '18%',
    aspectRatio: 0.85,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    position: 'relative',
    flex: 1,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSection: { marginBottom: Spacing.xl },
  noteInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    minHeight: 120,
  },
  noteText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    flex: 1,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  submitBtn: {},
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  successEmoji: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successEmojiText: { fontSize: 64 },
  successTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 26,
  },
  successBtn: { width: '100%' },
});

export default MoodTrackerScreen;
