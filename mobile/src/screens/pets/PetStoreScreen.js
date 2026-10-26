import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { petService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatPrice } from '../../utils/helpers';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_EMOJI = {
  cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐠',
  rabbit: '🐰', hamster: '🐹', turtle: '🐢',
};
const TYPE_COLORS = {
  dog:     ['#f0c070', '#e8a040'],
  cat:     ['#c084fc', '#9b59b6'],
  rabbit:  ['#f9a8d4', '#ec4899'],
  bird:    ['#67e8f9', '#22d3ee'],
  fish:    ['#60a5fa', '#3b82f6'],
  hamster: ['#fdba74', '#f97316'],
  turtle:  ['#86efac', '#22c55e'],
};

const petEmoji  = (type = '') => TYPE_EMOJI[type?.toLowerCase()]  || '🐾';
const petColors = (type = '') => TYPE_COLORS[type?.toLowerCase()] || [Colors.primary, Colors.secondary];

const PET_TYPES  = ['all', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster'];
const MOOD_CHIPS = ['calm', 'anxious', 'lonely', 'stress', 'playful', 'social', 'general', 'sad'];

const SAVED_KEY  = 'mh_pets_saved';
const loadSaved  = async () => { try { return new Set(JSON.parse(await AsyncStorage.getItem(SAVED_KEY)) || []); } catch { return new Set(); } };
const writeSaved = async (set) => { try { await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...set])); } catch {} };

// ─── Screen ───────────────────────────────────────────────────────────────────
const PetStoreScreen = ({ navigation }) => {
  const { theme }                          = useTheme();
  const { t }                              = useLanguage();
  const { addItem, isInCart, wasJustAdded, count } = useCart();

  const [pets,        setPets]        = useState([]);
  const [adoptedIds,  setAdoptedIds]  = useState(new Set());
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [actionLoading,setActionLoading]= useState(null);
  const [tab,         setTab]         = useState('all');   // 'all' | 'mine'
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [moodFilter,  setMoodFilter]  = useState('');
  const [savedIds,    setSavedIds]    = useState(new Set());

  useEffect(() => { loadSaved().then(setSavedIds); }, []);

  const load = useCallback(async () => {
    try {
      const [petsRes, adoptedRes] = await Promise.all([
        petService.getAll(),
        petService.getAdopted(),
      ]);
      const allPets    = petsRes.data?.pets    || petsRes.data    || [];
      const adopted    = adoptedRes.data?.pets || adoptedRes.data || [];
      setPets(Array.isArray(allPets) ? allPets : []);
      setAdoptedIds(new Set(adopted.map((p) => p._id)));
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filters ────────────────────────────────────────────────────────────────
  const displayed = pets.filter((pet) => {
    if (tab === 'mine' && !adoptedIds.has(pet._id)) return false;
    const matchType = typeFilter === 'all' || pet.type?.toLowerCase() === typeFilter;
    const matchMood = !moodFilter || pet.personality?.toLowerCase().includes(moodFilter);
    const matchSearch = !search ||
      pet.name?.toLowerCase().includes(search.toLowerCase()) ||
      pet.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchMood && matchSearch;
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  const toggleSave = useCallback(async (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      writeSaved(next);
      return next;
    });
  }, []);

  const handleAddToCart = useCallback((pet) => {
    addItem({
      id:       pet._id,
      itemType: 'pet',
      name:     pet.name,
      price:    pet.price || 0,
      image:    pet.image || '',
    });
  }, [addItem]);

  const handleAdopt = async (petId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActionLoading(petId);
    try {
      await petService.adopt(petId);
      setAdoptedIds((prev) => new Set([...prev, petId]));
      Alert.alert('🎉 Adopted!', "This pet is now part of your family.");
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not adopt.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnadopt = (petId) => {
    Alert.alert('Release Pet', 'Are you sure you want to release this pet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Release', style: 'destructive', onPress: async () => {
        setActionLoading(petId);
        try {
          await petService.unadopt(petId);
          setAdoptedIds((prev) => { const s = new Set(prev); s.delete(petId); return s; });
        } catch (_) {}
        finally { setActionLoading(null); }
      }},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title="Pet Store"
        onBack={() => navigation.goBack()}
        rightAction={
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
        }
      />

      {/* Hero */}
      <LinearGradient colors={[Colors.accent, Colors.accentDark]} style={styles.hero}>
        <Text style={styles.heroEmoji}>🐾</Text>
        <View>
          <Text style={styles.heroTitle}>Virtual Pet Adoption</Text>
          <Text style={styles.heroSub}>Adopt a companion, reduce loneliness</Text>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceAlt, marginHorizontal: Spacing.base, marginTop: Spacing.sm }]}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search pets..."
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

      {/* Type chips */}
      <FlatList
        horizontal
        data={PET_TYPES}
        keyExtractor={(tp) => tp}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item: tp }) => {
          const active = typeFilter === tp;
          return (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: active ? Colors.primary : theme.colors.surfaceAlt }]}
              onPress={() => setTypeFilter(tp)}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                {tp === 'all' ? '🐾 All' : `${petEmoji(tp)} ${tp}`}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Mood chips */}
      <FlatList
        horizontal
        data={MOOD_CHIPS}
        keyExtractor={(m) => m}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chips, { paddingTop: 0 }]}
        renderItem={({ item: m }) => {
          const active = moodFilter === m;
          return (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: active ? Colors.secondary : theme.colors.surfaceAlt }]}
              onPress={() => setMoodFilter((prev) => prev === m ? '' : m)}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                {m}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* All / My Pets tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.surfaceAlt, marginHorizontal: Spacing.base }]}>
        {[
          { key: 'all',  label: '🐾 All Pets' },
          { key: 'mine', label: `❤️ My Pets (${adoptedIds.size})` },
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

      {/* Grid */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item._id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: Spacing.sm }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={{ fontSize: 56 }}>🐾</Text>}
            title={tab === 'mine' ? 'No adopted pets yet' : 'No pets found'}
            subtitle={tab === 'mine' ? 'Adopt a pet to see them here' : 'Try adjusting your filters'}
          />
        }
        renderItem={({ item: pet }) => {
          const isSold    = pet.status === 'sold';
          const adopted   = adoptedIds.has(pet._id);
          const saved     = savedIds.has(pet._id);
          const inCart    = isInCart(pet._id, 'pet');
          const justAdded = wasJustAdded(pet._id, 'pet');
          const loading   = actionLoading === pet._id;
          const colors    = petColors(pet.type);
          const emoji     = petEmoji(pet.type);

          return (
            <Card style={[styles.petCard, isSold && styles.soldCard]} shadow="sm">
              {/* Sold ribbon */}
              {isSold && (
                <View style={styles.soldBadge}>
                  <Text style={styles.soldBadgeText}>SOLD</Text>
                </View>
              )}

              {/* Adopted heart */}
              {adopted && (
                <View style={styles.adoptedBadge}>
                  <Ionicons name="heart" size={10} color="#fff" />
                  <Text style={styles.adoptedBadgeText}>Adopted</Text>
                </View>
              )}

              {/* Image or gradient */}
              {pet.image
                ? <Image source={{ uri: pet.image }} style={styles.petImage} resizeMode="cover" />
                : (
                  <LinearGradient colors={colors} style={styles.petImage}>
                    <Text style={{ fontSize: 52 }}>{emoji}</Text>
                  </LinearGradient>
                )
              }

              <View style={styles.petBody}>
                {/* Emoji + personality row */}
                <View style={styles.topRow}>
                  <Text style={{ fontSize: 18 }}>{emoji}</Text>
                  {!!pet.personality && (
                    <View style={[styles.personalityBadge, { backgroundColor: Colors.secondary + '22' }]}>
                      <Text style={[styles.personalityText, { color: Colors.secondary }]}>{pet.personality}</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.petName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {pet.name}
                </Text>

                {/* Type badge */}
                {!!pet.type && (
                  <View style={[styles.typeBadge, { backgroundColor: colors[0] + '30' }]}>
                    <Text style={[styles.typeText, { color: colors[1] }]}>{pet.type}</Text>
                  </View>
                )}

                {!!pet.description && (
                  <Text style={[styles.petDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {pet.description}
                  </Text>
                )}

                {/* Price */}
                <Text style={[styles.price, { color: Colors.primary }]}>
                  {pet.price > 0 ? formatPrice(pet.price) : '🆓 Free'}
                </Text>

                {/* Actions */}
                {!isSold && (
                  <>
                    <View style={styles.actions}>
                      {/* Save */}
                      <TouchableOpacity
                        style={[styles.saveBtn, { borderColor: saved ? Colors.primary : theme.colors.border }]}
                        onPress={() => toggleSave(pet._id)}
                      >
                        <Text style={[styles.saveBtnText, { color: saved ? Colors.primary : theme.colors.textTertiary }]}>
                          🔖 {saved ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>

                      {/* Add to Cart */}
                      <TouchableOpacity
                        style={[styles.cartBtn, {
                          backgroundColor: justAdded ? '#22c55e' : inCart ? theme.colors.surfaceAlt : Colors.primary,
                        }]}
                        onPress={() => !inCart && handleAddToCart(pet)}
                        disabled={inCart}
                      >
                        <Text style={[styles.cartBtnText, { color: inCart && !justAdded ? theme.colors.textTertiary : '#fff' }]}>
                          {justAdded ? '✅' : inCart ? '🛒' : '🛒'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Adopt / Release */}
                    <TouchableOpacity
                      style={[styles.adoptBtn, {
                        backgroundColor: adopted ? Colors.error + '15' : Colors.accent + '15',
                        borderColor: adopted ? Colors.error : Colors.accent,
                      }]}
                      onPress={() => adopted ? handleUnadopt(pet._id) : handleAdopt(pet._id)}
                      disabled={loading}
                    >
                      <Text style={[styles.adoptBtnText, { color: adopted ? Colors.error : Colors.accent }]}>
                        {loading ? '⏳ Please wait...' : adopted ? '💔 Release' : '💙 Adopt'}
                      </Text>
                    </TouchableOpacity>
                  </>
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
  headerBtn:        { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cartBadge:        { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  cartBadgeText:    { color: '#fff', fontSize: 9, fontWeight: '800' },
  hero:             { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.md },
  heroEmoji:        { fontSize: 40 },
  heroTitle:        { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.white },
  heroSub:          { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  searchBar:        { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  searchInput:      { flex: 1, fontSize: Typography.fontSize.sm },
  chips:            { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip:             { paddingVertical: 6, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.full },
  chipText:         { fontSize: Typography.fontSize.xs, fontWeight: '600' },
  tabs:             { flexDirection: 'row', marginBottom: Spacing.sm, borderRadius: BorderRadius.md, padding: 4 },
  tab:              { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabText:          { fontSize: Typography.fontSize.sm },
  grid:             { padding: Spacing.base, paddingTop: Spacing.sm, gap: Spacing.sm },
  petCard:          { flex: 1, padding: 0, overflow: 'hidden', position: 'relative' },
  soldCard:         { opacity: 0.6 },
  soldBadge:        { position: 'absolute', top: 8, left: 8, zIndex: 2, backgroundColor: Colors.error, paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  soldBadgeText:    { color: '#fff', fontSize: 9, fontWeight: '800' },
  adoptedBadge:     { position: 'absolute', top: 8, right: 8, zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.error, paddingVertical: 3, paddingHorizontal: 6, borderRadius: BorderRadius.full },
  adoptedBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  petImage:         { height: 130, width: '100%', alignItems: 'center', justifyContent: 'center' },
  petBody:          { padding: Spacing.sm },
  topRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  personalityBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: BorderRadius.full },
  personalityText:  { fontSize: 9, fontWeight: '700' },
  petName:          { fontSize: Typography.fontSize.sm, fontWeight: '800', marginBottom: 3 },
  typeBadge:        { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: BorderRadius.full, marginBottom: 4 },
  typeText:         { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  petDesc:          { fontSize: Typography.fontSize.xs, lineHeight: 16, opacity: 0.85, marginBottom: 4 },
  price:            { fontSize: Typography.fontSize.sm, fontWeight: '800', marginBottom: 6 },
  actions:          { flexDirection: 'row', gap: 4, marginBottom: 4 },
  saveBtn:          { flex: 1, paddingVertical: 5, borderRadius: BorderRadius.sm, borderWidth: 1, alignItems: 'center' },
  saveBtnText:      { fontSize: 10, fontWeight: '700' },
  cartBtn:          { width: 34, paddingVertical: 5, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  cartBtnText:      { fontSize: 14 },
  adoptBtn:         { paddingVertical: 7, borderRadius: BorderRadius.sm, alignItems: 'center', borderWidth: 1 },
  adoptBtnText:     { fontSize: Typography.fontSize.xs, fontWeight: '800' },
});

export default PetStoreScreen;
