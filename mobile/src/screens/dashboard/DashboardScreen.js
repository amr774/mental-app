import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { dashboardService, moodService, goalService } from '../../api/services';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import MoodBadge from '../../components/MoodBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { getGreeting, formatDate, getMoodEmoji, truncate } from '../../utils/helpers';

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [recentMoods, setRecentMoods] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [moodsRes, goalsRes] = await Promise.all([
        moodService.getHistory(),
        goalService.getAll(),
      ]);
      setRecentMoods((moodsRes.data?.moods || moodsRes.data || []).slice(0, 5));
      setGoals((goalsRes.data?.goals || goalsRes.data || []).slice(0, 4));
    } catch (_) {
      // Silently fail — dashboard should always show something
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const completedGoals = goals.filter((g) => g.completed).length;
  const goalProgress = goals.length > 0 ? completedGoals / goals.length : 0;

  const quickActions = [
    { icon: 'chatbubble-ellipses-outline', label: 'Chat', color: Colors.primary, screen: 'ChatTab' },
    { icon: 'journal-outline', label: t('journal'), color: Colors.secondary, screen: 'Journal', stack: 'HomeTab' },
    { icon: 'flower-outline', label: t('breathe'), color: Colors.accent, screen: 'Breathe', stack: 'HomeTab' },
    { icon: 'newspaper-outline', label: t('articles'), color: Colors.warning, screen: 'Articles', stack: 'HomeTab' },
    { icon: 'paw-outline', label: t('pets'), color: Colors.secondaryDark, screen: 'PetStore', stack: 'HomeTab' },
    { icon: 'people-outline', label: t('community'), color: Colors.accentDark, screen: 'CommunityTab' },
  ];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting(t)}</Text>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Friend'} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
              <Avatar uri={user?.avatar} name={user?.name} size={52} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBanner}>
            <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroBannerText}>
              Every small step counts. You're doing great!
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              {t('quickActions')}
            </Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <QuickAction
                  key={action.label}
                  icon={action.icon}
                  label={action.label}
                  color={action.color}
                  onPress={() => {
                    if (action.stack) {
                      navigation.navigate(action.stack, { screen: action.screen });
                    } else {
                      navigation.navigate(action.screen);
                    }
                  }}
                />
              ))}
            </View>
          </View>

          {/* Weekly Goal Progress */}
          {goals.length > 0 && (
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                  {t('weeklyGoals')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'Goals' })}>
                  <Text style={[styles.viewAll, { color: Colors.primary }]}>{t('viewAll')}</Text>
                </TouchableOpacity>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${goalProgress * 100}%`, backgroundColor: Colors.accent },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {completedGoals}/{goals.length} completed
                </Text>
              </View>

              {goals.slice(0, 3).map((goal) => (
                <View key={goal._id} style={styles.goalItem}>
                  <Ionicons
                    name={goal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={goal.completed ? Colors.accent : theme.colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.goalText,
                      { color: theme.colors.textPrimary },
                      goal.completed && styles.goalCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {goal.title}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Recent Moods */}
          {recentMoods.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                  {t('recentMoods')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('MoodTab', { screen: 'MoodHistory' })}>
                  <Text style={[styles.viewAll, { color: Colors.primary }]}>{t('viewAll')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.moodsRow}>
                {recentMoods.map((mood) => (
                  <Card key={mood._id} style={styles.moodCard} shadow="sm">
                    <Text style={styles.moodEmoji}>{getMoodEmoji(mood.value || mood.mood)}</Text>
                    <Text style={[styles.moodDate, { color: theme.colors.textTertiary }]}>
                      {formatDate(mood.createdAt || mood.date, 'short')}
                    </Text>
                    {mood.note && (
                      <Text
                        style={[styles.moodNote, { color: theme.colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {truncate(mood.note, 40)}
                      </Text>
                    )}
                  </Card>
                ))}
              </View>
            </View>
          )}

          {/* Log Mood CTA */}
          <TouchableOpacity
            style={styles.logMoodCta}
            onPress={() => navigation.navigate('MoodTab')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logMoodGradient}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.white} />
              <Text style={styles.logMoodText}>Log today's mood</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Admin shortcut */}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.adminBanner, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => navigation.navigate('HomeTab', { screen: 'Admin' })}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <Text style={[styles.adminText, { color: Colors.primary }]}>Admin Dashboard</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 6,
    marginTop: Spacing.sm,
  },
  heroBannerText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  content: { padding: Spacing.base },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  viewAll: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickAction: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: { marginBottom: Spacing.md },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'right',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  goalText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
  },
  goalCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  moodsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    minWidth: 60,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodDate: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
  moodNote: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 4,
  },
  logMoodCta: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  logMoodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  logMoodText: {
    flex: 1,
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  adminText: {
    flex: 1,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.base,
  },
});

export default DashboardScreen;
