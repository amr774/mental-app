import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatDate, truncate } from '../../utils/helpers';

const JournalScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await journalService.getAll();
      setEntries(res.data?.journals || res.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [load, navigation]);

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await journalService.remove(id);
            setEntries((prev) => prev.filter((e) => e._id !== id));
          } catch (_) {
            Alert.alert('Error', 'Failed to delete entry.');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title={t('journal')}
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'add',
          onPress: () => navigation.navigate('JournalEntry', { entry: null }),
        }}
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="journal-outline" size={56} color={theme.colors.textTertiary} />}
            title={t('noEntries')}
            subtitle={t('startJournal')}
            actionLabel={t('newEntry')}
            onAction={() => navigation.navigate('JournalEntry', { entry: null })}
          />
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('JournalEntry', { entry: item })}
            shadow="sm"
          >
            <View style={styles.cardHeader}>
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
              <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
                {formatDate(item.createdAt || item.date, 'long')}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item._id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
            {item.title && (
              <Text style={[styles.entryTitle, { color: theme.colors.textPrimary }]}>
                {item.title}
              </Text>
            )}
            <Text style={[styles.entryContent, { color: theme.colors.textSecondary }]}>
              {truncate(item.content, 120)}
            </Text>
            {item.mood && (
              <View style={styles.moodTag}>
                <Text style={styles.moodTagText}>
                  {item.mood === 'happy' ? '😊' : item.mood === 'sad' ? '😢' : item.mood === 'anxious' ? '😰' : '😐'}{' '}
                  {item.mood}
                </Text>
              </View>
            )}
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: { padding: Spacing.base, gap: Spacing.md },
  card: { gap: Spacing.xs },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  date: { flex: 1, fontSize: Typography.fontSize.xs },
  entryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  entryContent: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  moodTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary + '20',
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
  },
  moodTagText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
});

export default JournalScreen;
