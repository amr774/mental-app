import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { personalityService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const QUESTIONS = [
  { id: 1, text: 'I feel energized after spending time with a large group of people.', category: 'extraversion' },
  { id: 2, text: 'I often feel overwhelmed by too much social interaction.', category: 'introversion' },
  { id: 3, text: 'I tend to focus on the present moment rather than the future.', category: 'sensing' },
  { id: 4, text: 'I enjoy exploring abstract ideas and possibilities.', category: 'intuition' },
  { id: 5, text: 'I make decisions based on logic rather than emotions.', category: 'thinking' },
  { id: 6, text: 'I consider how decisions affect others\' feelings.', category: 'feeling' },
  { id: 7, text: 'I prefer having a structured, planned approach to life.', category: 'judging' },
  { id: 8, text: 'I prefer keeping my options open and being flexible.', category: 'perceiving' },
  { id: 9, text: 'I find it easy to express my emotions to others.', category: 'feeling' },
  { id: 10, text: 'I often lose track of time when working on something I enjoy.', category: 'intuition' },
];

const OPTIONS = [
  { value: 5, label: 'Strongly Agree' },
  { value: 4, label: 'Agree' },
  { value: 3, label: 'Neutral' },
  { value: 2, label: 'Disagree' },
  { value: 1, label: 'Strongly Disagree' },
];

const PersonalityTestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const currentQuestion = Object.keys(answers).length;

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    setLoading(true);
    try {
      const formattedAnswers = QUESTIONS.map((q) => ({
        questionId: q.id,
        question: q.text,
        answer: answers[q.id],
        category: q.category,
      }));
      const res = await personalityService.submit(formattedAnswers);
      navigation.replace('PersonalityResult', { result: res.data?.result || res.data });
    } catch (_) {
      Alert.alert('Error', 'Failed to submit test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = Object.keys(answers).length / QUESTIONS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Personality Test" onBack={() => navigation.goBack()} />

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {Object.keys(answers).length}/{QUESTIONS.length} answered
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {QUESTIONS.map((q, idx) => {
          const answered = answers[q.id];
          return (
            <View key={q.id} style={styles.questionBlock}>
              <View style={styles.questionHeader}>
                <View style={[styles.questionNum, { backgroundColor: answered ? Colors.primary : theme.colors.surfaceAlt }]}>
                  <Text style={{ color: answered ? Colors.white : theme.colors.textTertiary, fontWeight: '700', fontSize: 13 }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={[styles.questionText, { color: theme.colors.textPrimary }]}>
                  {q.text}
                </Text>
              </View>
              <View style={styles.options}>
                {OPTIONS.map((opt) => {
                  const isSelected = answered === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => handleAnswer(q.id, opt.value)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected ? Colors.primary + '18' : theme.colors.surfaceAlt,
                          borderColor: isSelected ? Colors.primary : 'transparent',
                          borderWidth: isSelected ? 2 : 0,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                      )}
                      <Text style={[styles.optionText, { color: isSelected ? Colors.primary : theme.colors.textSecondary, fontWeight: isSelected ? '700' : '400' }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Button
          title={loading ? 'Analyzing...' : 'Get My Results'}
          onPress={handleSubmit}
          loading={loading}
          disabled={Object.keys(answers).length < QUESTIONS.length}
          style={styles.submitBtn}
        />
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  progressSection: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  progressTrack: { height: 6, borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { fontSize: Typography.fontSize.xs, textAlign: 'right' },
  scroll: { padding: Spacing.base },
  questionBlock: { marginBottom: Spacing.xl },
  questionHeader: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  questionNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  questionText: { flex: 1, fontSize: Typography.fontSize.base, lineHeight: 24, fontWeight: '500' },
  options: { gap: Spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  optionText: { fontSize: Typography.fontSize.sm },
  submitBtn: { marginTop: Spacing.base },
});

export default PersonalityTestScreen;
