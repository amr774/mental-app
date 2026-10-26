import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { moodService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import MoodBadge from '../../components/MoodBadge';
import { Colors, Typography, Spacing } from '../../theme';
import { formatDate, getMoodEmoji, getMoodColor, getMoodByValue } from '../../utils/helpers';

const MoodHistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await moodService.getHistory();
      setMoods(res.data?.moods || res.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const avgMood = moods.length > 0
    ? (moods.reduce((sum, m) => sum + getMoodByValue(m.mood || m.value || 3).value, 0) / moods.length).toFixed(1)
    : null;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title={t('moodHistory')}
        onBack={() => navigation.goBack()}
      />

      {/* Stats Banner */}
      {moods.length > 0 && (
        <View style={[styles.statsBanner, { backgroundColor: Colors.primary + '15' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{moods.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total logs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{avgMood}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg mood</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>
              {getMoodEmoji(Math.round(parseFloat(avgMood || 3)))}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Overall</Text>
          </View>
        </View>
      )}

      <FlatList
        data={moods}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="heart-outline" size={56} color={theme.colors.textTertiary} />}
            title="No moods logged yet"
            subtitle="Start tracking your mood daily to see patterns and insights."
            actionLabel="Log a Mood"
            onAction={() => navigation.goBack()}
          />
        }
        renderItem={({ item }) => {
          const value = item.value || item.mood || 3;
          const color = getMoodColor(value);
          return (
            <Card style={styles.moodCard} shadow="sm">
              <View style={styles.moodRow}>
                <View style={[styles.moodColorBar, { backgroundColor: color }]} />
                <View style={styles.moodContent}>
                  <View style={styles.moodTop}>
                    <MoodBadge value={value} showLabel size="md" />
                    <Text style={[styles.moodDate, { color: theme.colors.textTertiary }]}>
                      {formatDate(item.createdAt || item.date, 'datetime')}
                    </Text>
                  </View>
                  {item.note ? (
                    <Text style={[styles.moodNote, { color: theme.colors.textSecondary }]}>
                      {item.note}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  statsBanner: {
    flexDirection: 'row',
    margin: Spacing.base,
    borderRadius: 16,
    padding: Spacing.base,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  statEmoji: { fontSize: 28 },
  statLabel: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: '#00000015' },
  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm },
  moodCard: { padding: 0, overflow: 'hidden' },
  moodRow: { flexDirection: 'row' },
  moodColorBar: { width: 5 },
  moodContent: { flex: 1, padding: Spacing.md },
  moodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  moodDate: { fontSize: Typography.fontSize.xs },
  moodNote: { fontSize: Typography.fontSize.sm, lineHeight: 20 },
});

export default MoodHistoryScreen;
