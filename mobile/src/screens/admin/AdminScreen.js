import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatDate, timeAgo } from '../../utils/helpers';

const StatCard = ({ label, value, icon, color }) => {
  const { theme } = useTheme();
  return (
    <Card style={styles.statCard} shadow="sm">
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </Card>
  );
};

const AdminScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('overview'); // 'overview' | 'users'

  const load = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(),
      ]);
      setStats(statsRes.data?.stats || statsRes.data);
      setUsers(usersRes.data?.users || usersRes.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Delete user "${userName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(userId);
              setUsers((prev) => prev.filter((u) => u._id !== userId));
            } catch (_) {
              Alert.alert('Error', 'Failed to delete user.');
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Admin Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.secondary]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Platform Overview</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="shield-checkmark" size={28} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceAlt }]}>
        {['overview', 'users'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabItem, tab === t && styles.tabItemActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? Colors.primary : theme.colors.textTertiary, fontWeight: tab === t ? '700' : '400' }]}>
              {t === 'overview' ? 'Overview' : `Users (${users.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'overview' && (
          <View style={styles.content}>
            {/* Stats Grid */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Platform Stats</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Total Users" value={stats?.totalUsers || users.length} icon="people-outline" color={Colors.primary} />
              <StatCard label="Total Moods" value={stats?.totalMoods || '–'} icon="heart-outline" color={Colors.error} />
              <StatCard label="Journals" value={stats?.totalJournals || '–'} icon="journal-outline" color={Colors.secondary} />
              <StatCard label="Posts" value={stats?.totalPosts || '–'} icon="chatbubbles-outline" color={Colors.accent} />
              <StatCard label="Goals Set" value={stats?.totalGoals || '–'} icon="flag-outline" color={Colors.warning} />
              <StatCard label="Pet Adoptions" value={stats?.totalAdoptions || '–'} icon="paw-outline" color={Colors.accentDark} />
            </View>

            {/* Recent Users Preview */}
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: Spacing.xl }]}>
              Recent Users
            </Text>
            {users.slice(0, 5).map((u) => (
              <Card key={u._id} style={styles.userCard} shadow="sm">
                <View style={styles.userRow}>
                  <Avatar uri={u.avatar} name={u.name} size={44} />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{u.name}</Text>
                    <Text style={[styles.userEmail, { color: theme.colors.textTertiary }]}>{u.email}</Text>
                    <Text style={[styles.userJoined, { color: theme.colors.textTertiary }]}>
                      Joined {timeAgo(u.createdAt)}
                    </Text>
                  </View>
                  {u.role === 'admin' && (
                    <View style={[styles.roleBadge, { backgroundColor: Colors.primary + '20' }]}>
                      <Text style={[styles.roleText, { color: Colors.primary }]}>Admin</Text>
                    </View>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {tab === 'users' && (
          <View style={styles.content}>
            {users.map((u) => (
              <Card key={u._id} style={styles.userCard} shadow="sm">
                <View style={styles.userRow}>
                  <Avatar uri={u.avatar} name={u.name} size={44} />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{u.name}</Text>
                    <Text style={[styles.userEmail, { color: theme.colors.textTertiary }]}>{u.email}</Text>
                    <Text style={[styles.userJoined, { color: theme.colors.textTertiary }]}>
                      {formatDate(u.createdAt, 'short')}
                    </Text>
                  </View>
                  <View style={styles.userActions}>
                    {u.role === 'admin' && (
                      <View style={[styles.roleBadge, { backgroundColor: Colors.primary + '20' }]}>
                        <Text style={[styles.roleText, { color: Colors.primary }]}>Admin</Text>
                      </View>
                    )}
                    {u.role !== 'admin' && (
                      <TouchableOpacity
                        onPress={() => handleDeleteUser(u._id, u.name)}
                        style={styles.deleteBtn}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.white },
  headerSubtitle: { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerRight: { marginLeft: 'auto' },
  tabBar: { flexDirection: 'row', margin: Spacing.base, borderRadius: BorderRadius.md, padding: 4 },
  tabItem: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabItemActive: { backgroundColor: Colors.white },
  tabText: { fontSize: Typography.fontSize.sm },
  content: { paddingHorizontal: Spacing.base },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  statCard: { width: '30%', flex: 1, alignItems: 'center', gap: 6 },
  statIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: Typography.fontSize['2xl'], fontWeight: '800' },
  statLabel: { fontSize: Typography.fontSize.xs, textAlign: 'center' },
  userCard: { marginBottom: Spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userInfo: { flex: 1 },
  userName: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  userEmail: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  userJoined: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  userActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  roleBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  roleText: { fontSize: Typography.fontSize.xs, fontWeight: '700' },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminScreen;
