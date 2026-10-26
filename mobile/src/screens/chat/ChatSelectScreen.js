import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';

const BOTS = [
  {
    screen:      'MindfulChat',
    icon:        'leaf',
    name:        'Mindful AI',
    tagline:     'Your smart mental health companion',
    description: 'Chat freely about how you feel. Mindful AI listens, detects your mood, and suggests articles or pet companions to help you feel better.',
    gradient:    [Colors.primary, Colors.secondary],
  },
  {
    screen:      'WithUBot',
    icon:        'heart',
    name:        'WithUBot',
    tagline:     'Your empathetic digital friend',
    description: 'A warm, human-like companion that truly listens. Powered by a mental health knowledge base with deep emotional support and article recommendations.',
    gradient:    ['#a78bfa', '#60a5fa'],
  },
];

export default function ChatSelectScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Choose your companion</Text>
        <Text style={styles.headerSub}>Pick the one that feels right for you today</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {BOTS.map(bot => (
          <TouchableOpacity
            key={bot.screen}
            style={[styles.card, { backgroundColor: theme.colors.surface, ...Shadows.md }]}
            onPress={() => navigation.navigate(bot.screen)}
            activeOpacity={0.85}
          >
            {/* Icon */}
            <LinearGradient
              colors={bot.gradient}
              style={styles.iconCircle}
            >
              <Ionicons name={bot.icon} size={32} color="#fff" />
            </LinearGradient>

            {/* Text */}
            <Text style={[styles.botName, { color: theme.colors.textPrimary }]}>{bot.name}</Text>
            <Text style={[styles.botTagline, { color: bot.gradient[0] }]}>{bot.tagline.toUpperCase()}</Text>
            <Text style={[styles.botDesc, { color: theme.colors.textSecondary }]}>{bot.description}</Text>

            {/* Button */}
            <LinearGradient colors={bot.gradient} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start chatting</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  scroll: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  botName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  botTagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  botDesc: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: BorderRadius.full,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: Typography.fontSize.base,
  },
});
