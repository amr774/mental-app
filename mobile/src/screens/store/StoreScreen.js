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
import { storeService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatPrice, truncate } from '../../utils/helpers';

const StoreScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'mine'

  const load = useCallback(async () => {
    try {
      const res = tab === 'mine' ? await storeService.getMine() : await storeService.getAll();
      setItems(res.data?.items || res.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleMarkSold = (id) => {
    Alert.alert('Mark as Sold', 'Mark this item as sold?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Sold',
        onPress: async () => {
          try {
            await storeService.markSold(id);
            setItems((prev) => prev.map((i) => i._id === id ? { ...i, sold: true } : i));
          } catch (_) {}
        },
      },
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Listing', 'Delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await storeService.remove(id);
            setItems((prev) => prev.filter((i) => i._id !== id));
          } catch (_) {}
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title={t('store')}
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'add', onPress: () => navigation.navigate('CreateListing') }}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.surfaceAlt }]}>
        {['all', 'mine'].map((tabKey) => (
          <TouchableOpacity
            key={tabKey}
            style={[styles.tab, tab === tabKey && styles.tabActive]}
            onPress={() => setTab(tabKey)}
          >
            <Text style={[styles.tabText, { color: tab === tabKey ? Colors.primary : theme.colors.textTertiary, fontWeight: tab === tabKey ? '700' : '400' }]}>
              {tabKey === 'all' ? 'Browse' : t('myListings')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: Spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="bag-outline" size={56} color={theme.colors.textTertiary} />}
            title="No listings yet"
            subtitle={tab === 'mine' ? 'Create your first listing!' : 'No items in the store yet.'}
            actionLabel={t('createListing')}
            onAction={() => navigation.navigate('CreateListing')}
          />
        }
        renderItem={({ item }) => {
          const isOwner = item.seller?._id === user?._id || item.seller === user?._id;
          return (
            <Card style={[styles.itemCard, item.sold && styles.soldCard]} shadow="sm">
              {item.sold && (
                <View style={styles.soldBadge}>
                  <Text style={styles.soldBadgeText}>{t('sold')}</Text>
                </View>
              )}
              {/* Image placeholder */}
              <View style={[styles.itemImage, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="bag-outline" size={36} color={Colors.primary} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.itemPrice, { color: Colors.primary }]}>
                  {formatPrice(item.price)}
                </Text>
                {item.category && (
                  <Text style={[styles.itemCategory, { color: theme.colors.textTertiary }]}>
                    {item.category}
                  </Text>
                )}
              </View>
              {isOwner && !item.sold && (
                <View style={styles.ownerActions}>
                  <TouchableOpacity onPress={() => handleMarkSold(item._id)} style={[styles.ownerBtn, { backgroundColor: Colors.accent + '20' }]}>
                    <Text style={[styles.ownerBtnText, { color: Colors.accent }]}>Sold</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={[styles.ownerBtn, { backgroundColor: Colors.error + '20' }]}>
                    <Ionicons name="trash-outline" size={14} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', margin: Spacing.base, borderRadius: BorderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: Typography.fontSize.sm },
  grid: { padding: Spacing.base, paddingTop: 0, gap: Spacing.sm },
  itemCard: { flex: 1, padding: 0, overflow: 'hidden', position: 'relative' },
  soldCard: { opacity: 0.7 },
  soldBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    backgroundColor: Colors.error,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  soldBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  itemImage: { height: 120, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { padding: Spacing.sm },
  itemTitle: { fontSize: Typography.fontSize.sm, fontWeight: '600', lineHeight: 18, marginBottom: 4 },
  itemPrice: { fontSize: Typography.fontSize.base, fontWeight: '800', marginBottom: 2 },
  itemCategory: { fontSize: Typography.fontSize.xs, textTransform: 'capitalize' },
  ownerActions: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm },
  ownerBtn: { flex: 1, padding: 6, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  ownerBtnText: { fontSize: Typography.fontSize.xs, fontWeight: '700' },
});

export default StoreScreen;
