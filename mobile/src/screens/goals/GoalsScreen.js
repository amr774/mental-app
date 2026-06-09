import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { goalService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const GoalsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await goalService.getAll();
      setGoals(res.data?.goals || res.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (goal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoals((prev) =>
      prev.map((g) => (g._id === goal._id ? { ...g, completed: !g.completed } : g))
    );
    try {
      await goalService.toggle(goal._id);
    } catch (_) {
      // Revert on failure
      setGoals((prev) =>
        prev.map((g) => (g._id === goal._id ? { ...g, completed: goal.completed } : g))
      );
    }
  };

  const handleCreate = async () => {
    if (!newGoalText.trim()) return;
    setCreating(true);
    try {
      const res = await goalService.create({ title: newGoalText.trim() });
      const newGoal = res.data?.goal || res.data;
      setGoals((prev) => [newGoal, ...prev]);
      setNewGoalText('');
      setShowModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {
      Alert.alert('Error', 'Failed to create goal.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Goal', 'Delete this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await goalService.remove(id);
            setGoals((prev) => prev.filter((g) => g._id !== id));
          } catch (_) {}
        },
      },
    ]);
  };

  const completed = goals.filter((g) => g.completed).length;
  const progress = goals.length > 0 ? completed / goals.length : 0;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title={t('goals')}
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'add', onPress: () => setShowModal(true) }}
      />

      {/* Progress Card */}
      {goals.length > 0 && (
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.colors.textPrimary }]}>
              Weekly Progress
            </Text>
            <Text style={[styles.progressCount, { color: Colors.accent }]}>
              {completed}/{goals.length}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
            {progress === 1 ? '🎉 All goals completed!' : `${Math.round(progress * 100)}% complete`}
          </Text>
        </Card>
      )}

      <FlatList
        data={goals}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          goals.length > 0 ? (
            <View style={styles.tabs}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                Active ({goals.filter((g) => !g.completed).length})
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="flag-outline" size={56} color={theme.colors.textTertiary} />}
            title={t('noGoals')}
            subtitle={t('setGoals')}
            actionLabel={t('addGoal')}
            onAction={() => setShowModal(true)}
          />
        }
        renderItem={({ item }) => (
          <Card style={[styles.goalCard, item.completed && styles.goalCardCompleted]} shadow="sm">
            <TouchableOpacity
              style={styles.goalRow}
              onPress={() => handleToggle(item)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed
                    ? { backgroundColor: Colors.accent, borderColor: Colors.accent }
                    : { backgroundColor: 'transparent', borderColor: theme.colors.border },
                ]}
              >
                {item.completed && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <Text
                style={[
                  styles.goalTitle,
                  { color: item.completed ? theme.colors.textTertiary : theme.colors.textPrimary },
                  item.completed && styles.goalCompleted,
                ]}
              >
                {item.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item._id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        )}
      />

      {/* Add Goal Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                {t('addGoal')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}
              placeholder="What do you want to achieve this week?"
              placeholderTextColor={theme.colors.textTertiary}
              value={newGoalText}
              onChangeText={setNewGoalText}
              multiline
              maxLength={200}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button title={t('cancel')} onPress={() => setShowModal(false)} variant="outline" fullWidth={false} style={{ flex: 1 }} />
              <Button title={creating ? 'Adding...' : t('addGoal')} onPress={handleCreate} loading={creating} fullWidth={false} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  progressCard: { margin: Spacing.base, marginBottom: 0 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressTitle: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  progressCount: { fontSize: Typography.fontSize.xl, fontWeight: '700' },
  progressTrack: { height: 10, borderRadius: 5, marginBottom: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 5 },
  progressSubtitle: { fontSize: Typography.fontSize.sm },
  tabs: { marginBottom: Spacing.sm },
  sectionLabel: { fontSize: Typography.fontSize.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  list: { padding: Spacing.base, gap: Spacing.sm },
  goalCard: { padding: 0 },
  goalCardCompleted: { opacity: 0.7 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: { flex: 1, fontSize: Typography.fontSize.base, lineHeight: 22 },
  goalCompleted: { textDecorationLine: 'line-through' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: '700' },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: Spacing.xl,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md },
});

export default GoalsScreen;
