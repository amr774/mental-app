import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const MOOD_TAGS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'anxious', emoji: '😰', label: 'Anxious' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'angry', emoji: '😤', label: 'Angry' },
  { key: 'grateful', emoji: '🙏', label: 'Grateful' },
];

const JournalEntryScreen = ({ navigation, route }) => {
  const existingEntry = route.params?.entry;
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [title, setTitle] = useState(existingEntry?.title || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [selectedMood, setSelectedMood] = useState(existingEntry?.mood || null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Write something', 'Please add some content to your journal entry.');
      return;
    }
    setLoading(true);
    try {
      const data = { title: title.trim(), content: content.trim(), mood: selectedMood };
      if (existingEntry) {
        await journalService.update(existingEntry._id, data);
      } else {
        await journalService.create(data);
      }
      navigation.goBack();
    } catch (_) {
      Alert.alert('Error', 'Failed to save journal entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title={existingEntry ? 'Edit Entry' : t('newEntry')}
          onBack={() => navigation.goBack()}
          rightAction={
            <Button
              title={t('save')}
              onPress={handleSave}
              loading={loading}
              size="sm"
              fullWidth={false}
            />
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Date */}
          <Text style={[styles.dateLabel, { color: theme.colors.textTertiary }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>

          {/* Title */}
          <TextInput
            style={[styles.titleInput, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.border }]}
            placeholder="Entry title (optional)"
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Content */}
          <TextInput
            style={[styles.contentInput, { color: theme.colors.textPrimary }]}
            placeholder="What's on your mind? Let it all out..."
            placeholderTextColor={theme.colors.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus={!existingEntry}
          />

          {/* Mood Tags */}
          <Text style={[styles.moodLabel, { color: theme.colors.textSecondary }]}>
            How are you feeling?
          </Text>
          <View style={styles.moodTags}>
            {MOOD_TAGS.map((m) => {
              const isSelected = selectedMood === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setSelectedMood(isSelected ? null : m.key)}
                  style={[
                    styles.moodTag,
                    {
                      backgroundColor: isSelected ? Colors.secondary + '20' : theme.colors.surfaceAlt,
                      borderColor: isSelected ? Colors.secondary : 'transparent',
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodTagLabel, { color: isSelected ? Colors.secondary : theme.colors.textSecondary }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  dateLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  titleInput: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.base,
  },
  contentInput: {
    fontSize: Typography.fontSize.base,
    lineHeight: 28,
    minHeight: 300,
    marginBottom: Spacing.xl,
  },
  moodLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  moodEmoji: { fontSize: 18 },
  moodTagLabel: { fontSize: Typography.fontSize.sm, fontWeight: '500' },
});

export default JournalEntryScreen;
