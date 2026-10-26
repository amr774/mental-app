import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const PersonalityResultScreen = ({ navigation, route }) => {
  const { result } = route.params;
  const { theme } = useTheme();

  const personalityType = result?.type || result?.personalityType || 'INFP';
  const traits = result?.traits || [];
  const description = result?.description || 'Your personality profile has been analyzed. You show unique patterns of thinking, feeling, and behaving that make you who you are.';
  const strengths = result?.strengths || ['Empathetic', 'Creative', 'Open-minded'];
  const challenges = result?.challenges || ['May overthink', 'Sensitive to criticism'];

  const typeColors = {
    E: Colors.primary, I: Colors.secondary,
    N: Colors.accent, S: Colors.warning,
    T: Colors.info, F: Colors.error,
    J: Colors.accentDark, P: Colors.secondaryDark,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[Colors.secondary, Colors.primary]} style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.heroLabel}>Your Personality Type</Text>
          <Text style={styles.heroType}>{personalityType}</Text>
          <Text style={styles.heroDesc}>{result?.typeName || 'The Mediator'}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Type Letters */}
          <View style={styles.lettersRow}>
            {personalityType.split('').map((letter, idx) => (
              <View key={idx} style={[styles.letterCard, { backgroundColor: (typeColors[letter] || Colors.primary) + '20' }]}>
                <Text style={[styles.letter, { color: typeColors[letter] || Colors.primary }]}>{letter}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>About You</Text>
            <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>{description}</Text>
          </Card>

          {/* Strengths */}
          {strengths.length > 0 && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>✨ Strengths</Text>
              {strengths.map((s, i) => (
                <View key={i} style={styles.traitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                  <Text style={[styles.traitText, { color: theme.colors.textSecondary }]}>{s}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Challenges */}
          {challenges.length > 0 && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>🌱 Growth Areas</Text>
              {challenges.map((c, i) => (
                <View key={i} style={styles.traitRow}>
                  <Ionicons name="arrow-up-circle" size={18} color={Colors.warning} />
                  <Text style={[styles.traitText, { color: theme.colors.textSecondary }]}>{c}</Text>
                </View>
              ))}
            </Card>
          )}

          <Button
            title="Back to Home"
            onPress={() => navigation.navigate('Dashboard')}
            style={{ marginTop: Spacing.base }}
          />
          <Button
            title="Retake Test"
            onPress={() => navigation.replace('PersonalityTest')}
            variant="outline"
            style={{ marginTop: Spacing.md }}
          />
          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.fontSize.base, marginBottom: Spacing.sm },
  heroType: { fontSize: 56, fontWeight: '800', color: Colors.white, letterSpacing: 4 },
  heroDesc: { color: 'rgba(255,255,255,0.9)', fontSize: Typography.fontSize.lg, fontWeight: '600', marginTop: Spacing.sm },
  content: { padding: Spacing.base },
  lettersRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginVertical: Spacing.xl },
  letterCard: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: Typography.fontSize['3xl'], fontWeight: '800' },
  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  sectionText: { fontSize: Typography.fontSize.base, lineHeight: 26 },
  traitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  traitText: { fontSize: Typography.fontSize.base, flex: 1, lineHeight: 22 },
});

export default PersonalityResultScreen;
