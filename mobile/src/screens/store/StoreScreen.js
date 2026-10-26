import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatPrice } from '../../utils/helpers';

const CATEGORIES = ['all', 'general', 'books', 'electronics', 'toys', 'accessories', 'wellness', 'fitness', 'other'];

const CAT_DISPLAY = {
  books:       { emoji: '📚', colors: ['#60a5fa', '#3b82f6'], label: 'Books' },
  electronics: { emoji: '💻', colors: ['#818cf8', '#6366f1'], label: 'Electronics' },
  toys:        { emoji: '🧸', colors: ['#f9a8d4', '#ec4899'], label: 'Toys' },
  accessories: { emoji: '🧘', colors: ['#c084fc', '#9b59b6'], label: 'Accessories' },
  wellness:    { emoji: '🌿', colors: ['#86efac', '#22c55e'], label: 'Wellness' },
  fitness:     { emoji: '💪', colors: ['#fdba74', '#f97316'], label: 'Fitness' },
  general:     { emoji: '🛍️', colors: ['#4ecdc4', '#2cb5b5'], label: 'General' },
  other:       { emoji: '📦', colors: ['#94a3b8', '#64748b'], label: 'Other' },
};

const CONDITION_COLORS = {
  new:        '#4ade80',
  'like-new': '#4ecdc4',
  good:       '#94a3b8',
  fair:       '#fbbf24',
};

const getCat = (cat) => CAT_DISPLAY[cat?.toLowerCase()] || CAT_DISPLAY.other;

const SAVED_KEY = 'mh_store_saved';
const loadSaved  = async () => { try { return new Set(JSON.parse(await AsyncStorage.getItem(SAVED_KEY)) || []); } catch { return new Set(); } };
const writeSaved = async (set) => { try { await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...set])); } catch {} };

const StoreScreen = ({ navigation }) => {
  const { user }                  = useAuth();
  const { theme }                 = useTheme();
  const { t }                     = useLanguage();
  const { addItem, isInCart, wasJustAdded, count } = useCart();

  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [tab,       setTab]       = useState('browse');
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('all');
  const [savedIds,  setSavedIds]  = useState(new Set());

  useEffect(() => { loadSaved().then(setSavedIds); }, []);

  const load = useCallback(async () => {
    try {
      const res = tab === 'mine' ? await storeService.getMine() : await storeService.getAll();
      const raw = res.data?.items || res.data || [];
      setItems(Array.isArray(raw) ? raw : []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, [tab]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const toggleSave = useCallback(async (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      writeSaved(next);
      return next;
    });
  }, []);

  const handleAddToCart = useCallback((item) => {
    addItem({
      id:       item._id,
      itemType: 'store',
      name:     item.title,
      price:    item.price || 0,
      image:    item.image || '',
    });
  }, [addItem]);

  const handleMarkSold = (id) => {
    Alert.alert('Mark as Sold', 'Mark this item as sold?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Sold', onPress: async () => {
        try {
          await storeService.markSold(id);
          setItems((prev) => prev.map((i) => i._id === id ? { ...i, status: 'sold' } : i));
        } catch (_) {}
      }},
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Listing', 'Delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await storeService.remove(id);
          setItems((prev) => prev.filter((i) => i._id !== id));
        } catch (_) {}
      }},
    ]);
  };

  const filtered = items.filter((item) => {
    const matchSearch  = !search   || item.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat     = category === 'all' || item.category?.toLowerCase() === category;
    return matchSearch && matchCat;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title="Store"
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart-outline" size={20} color={theme.colors.textPrimary} />
              {count > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => navigation.navigate('CreateListing')}
            >
              <Ionicons name="add" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceAlt, marginHorizontal: Spacing.base, marginBottom: 0, marginTop: Spacing.sm }]}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search listings..."
          placeholderTextColor={theme.colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item: c }) => {
          const active = category === c;
          const d = CAT_DISPLAY[c];
          return (
            <TouchableOpacity
              onPress={() => setCategory(c)}
              style={[styles.chip, { backgroundColor: active ? Colors.primary : theme.colors.surfaceAlt }]}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                {c === 'all' ? 'All' : `${d?.emoji} ${d?.label || c}`}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.surfaceAlt, marginHorizontal: Spacing.base }]}>
        {[
          { key: 'browse', label: '🛒 Browse' },
          { key: 'mine',   label: '📦 My Listings' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && { backgroundColor: Colors.white }]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, { color: tab === key ? Colors.primary : theme.colors.textTertiary, fontWeight: tab === key ? '700' : '400' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: Spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={{ fontSize: 48 }}>🛒</Text>}
            title="No listings yet"
            subtitle={tab === 'mine' ? 'Tap + to create your first listing' : 'No items match your search'}
            actionLabel="Create Listing"
            onAction={() => navigation.navigate('CreateListing')}
          />
        }
        renderItem={({ item }) => {
          const isOwner   = item.sellerId === user?._id || item.sellerId?.toString() === user?._id?.toString();
          const isSold    = item.status === 'sold';
          const cat       = getCat(item.category);
          const condColor = CONDITION_COLORS[item.condition] || '#94a3b8';
          const saved     = savedIds.has(item._id);
          const inCart    = isInCart(item._id, 'store');
          const justAdded = wasJustAdded(item._id, 'store');

          return (
            <Card style={[styles.itemCard, isSold && styles.soldCard]} shadow="sm">
              {/* Sold ribbon */}
              {isSold && (
                <View style={styles.soldBadge}>
                  <Text style={styles.soldBadgeText}>SOLD</Text>
                </View>
              )}

              {/* Image or gradient placeholder */}
              {item.image
                ? <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                : (
                  <LinearGradient colors={cat.colors} style={styles.itemImage}>
                    <Text style={{ fontSize: 40 }}>{cat.emoji}</Text>
                  </LinearGradient>
                )
              }

              <View style={styles.itemBody}>
                {/* Top row: category icon + condition badge */}
                <View style={styles.topRow}>
                  <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                  {item.condition && (
                    <View style={[styles.condBadge, { backgroundColor: condColor + '22' }]}>
                      <Text style={[styles.condText, { color: condColor }]}>{item.condition}</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                  {item.title}
                </Text>

                {!!item.description && (
                  <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* Footer: price + category */}
                <View style={styles.footer}>
                  <Text style={[styles.price, { color: Colors.primary }]}>
                    {formatPrice(item.price)}
                  </Text>
                  <Text style={[styles.catLabel, { color: theme.colors.textTertiary }]}>
                    {cat.label}
                  </Text>
                </View>

                {/* Seller */}
                {(item.sellerName) && (
                  <Text style={[styles.sellerName, { color: theme.colors.textTertiary }]}>
                    👤 {item.sellerName}
                  </Text>
                )}

                {/* Actions for non-sold, non-owner */}
                {!isSold && !isOwner && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.saveBtn, { borderColor: saved ? Colors.primary : theme.colors.border }]}
                      onPress={() => toggleSave(item._id)}
                    >
                      <Text style={{ fontSize: 14 }}>{saved ? '🔖' : '🔖'}</Text>
                      <Text style={[styles.saveBtnText, { color: saved ? Colors.primary : theme.colors.textTertiary }]}>
                        {saved ? 'Saved' : 'Save'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.cartBtn, {
                        backgroundColor: justAdded ? '#22c55e' : inCart ? theme.colors.surfaceAlt : Colors.primary,
                      }]}
                      onPress={() => !inCart && handleAddToCart(item)}
                      disabled={inCart}
                    >
                      <Text style={styles.cartBtnText}>
                        {justAdded ? '✅ Added' : inCart ? '🛒 In Cart' : '🛒 Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Owner actions */}
                {isOwner && !isSold && (
                  <View style={styles.ownerActions}>
                    <TouchableOpacity onPress={() => handleMarkSold(item._id)} style={[styles.ownerBtn, { backgroundColor: Colors.accent + '20' }]}>
                      <Text style={[styles.ownerBtnText, { color: Colors.accent }]}>✓ Sold</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={[styles.ownerBtn, { backgroundColor: Colors.error + '20' }]}>
                      <Ionicons name="trash-outline" size={14} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerBtn:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cartBadge:    { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  cartBadgeText:{ color: '#fff', fontSize: 9, fontWeight: '800' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  searchInput:  { flex: 1, fontSize: Typography.fontSize.sm },
  chips:        { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip:         { paddingVertical: 6, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  chipText:     { fontSize: Typography.fontSize.xs, fontWeight: '600' },
  tabs:         { flexDirection: 'row', marginBottom: Spacing.sm, borderRadius: BorderRadius.md, padding: 4 },
  tab:          { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabText:      { fontSize: Typography.fontSize.sm },
  grid:         { padding: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.sm },
  itemCard:     { flex: 1, padding: 0, overflow: 'hidden', position: 'relative' },
  soldCard:     { opacity: 0.6 },
  soldBadge:    { position: 'absolute', top: 8, left: 8, zIndex: 2, backgroundColor: Colors.error, paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  soldBadgeText:{ color: '#fff', fontSize: 9, fontWeight: '800' },
  itemImage:    { height: 120, width: '100%', alignItems: 'center', justifyContent: 'center' },
  itemBody:     { padding: Spacing.sm },
  topRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  condBadge:    { paddingVertical: 2, paddingHorizontal: 6, borderRadius: BorderRadius.full },
  condText:     { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  itemTitle:    { fontSize: Typography.fontSize.sm, fontWeight: '700', lineHeight: 18, marginBottom: 3 },
  itemDesc:     { fontSize: Typography.fontSize.xs, lineHeight: 16, opacity: 0.8, marginBottom: 4 },
  footer:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  price:        { fontSize: Typography.fontSize.base, fontWeight: '800' },
  catLabel:     { fontSize: 10, fontWeight: '500' },
  sellerName:   { fontSize: Typography.fontSize.xs, marginBottom: 6 },
  actions:      { flexDirection: 'row', gap: 4, marginTop: 2 },
  saveBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6, borderRadius: BorderRadius.sm, borderWidth: 1 },
  saveBtnText:  { fontSize: 10, fontWeight: '700' },
  cartBtn:      { flex: 2, paddingVertical: 6, borderRadius: BorderRadius.sm, alignItems: 'center' },
  cartBtnText:  { color: '#fff', fontSize: 10, fontWeight: '700' },
  ownerActions: { flexDirection: 'row', gap: 4, marginTop: 4 },
  ownerBtn:     { flex: 1, padding: 6, borderRadius: BorderRadius.sm, alignItems: 'center' },
  ownerBtnText: { fontSize: Typography.fontSize.xs, fontWeight: '700' },
});

export default StoreScreen;
