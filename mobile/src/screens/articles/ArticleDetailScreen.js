import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatDate } from '../../utils/helpers';

const ArticleDetailScreen = ({ navigation, route }) => {
  const { article } = route.params;
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} transparent />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={48} color="rgba(255,255,255,0.9)" />
          </View>
          {article.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{article.category}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {article.title}
          </Text>

          {article.author && (
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                {article.author}
              </Text>
              <View style={styles.dot} />
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                {formatDate(article.createdAt, 'short')}
              </Text>
            </View>
          )}

          {article.summary && (
            <View style={[styles.summaryBox, { backgroundColor: Colors.primary + '12', borderLeftColor: Colors.primary }]}>
              <Text style={[styles.summaryText, { color: theme.colors.textPrimary }]}>
                {article.summary}
              </Text>
            </View>
          )}

          <Text style={[styles.body, { color: theme.colors.textPrimary }]}>
            {article.content}
          </Text>

          {article.references && article.references.length > 0 && (
            <View style={[styles.references, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.referencesTitle, { color: theme.colors.textSecondary }]}>
                References
              </Text>
              {article.references.map((ref, idx) => (
                <Text key={idx} style={[styles.reference, { color: theme.colors.textTertiary }]}>
                  [{idx + 1}] {ref}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: Spacing.base,
    right: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: { padding: Spacing.xl },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 34,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
  },
  metaText: { fontSize: Typography.fontSize.sm },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
  summaryBox: {
    borderLeftWidth: 4,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryText: {
    fontSize: Typography.fontSize.base,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  body: {
    fontSize: Typography.fontSize.base,
    lineHeight: 28,
  },
  references: {
    marginTop: Spacing['2xl'],
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
  },
  referencesTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  reference: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
});

export default ArticleDetailScreen;
