import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { petService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const PET_EMOJIS = { dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🐦', fish: '🐠', hamster: '🐹', turtle: '🐢' };

const PetCard = ({ pet, onAdopt, onUnadopt, adopted, loading }) => {
  const { theme } = useTheme();
  const emoji = PET_EMOJIS[pet.species?.toLowerCase()] || '🐾';

  return (
    <Card style={styles.petCard} shadow="md">
      <View style={[styles.petImageContainer, { backgroundColor: Colors.primary + '15' }]}>
        <Text style={styles.petEmoji}>{emoji}</Text>
        {adopted && (
          <View style={styles.adoptedBadge}>
            <Ionicons name="heart" size={12} color={Colors.white} />
            <Text style={styles.adoptedBadgeText}>Adopted</Text>
          </View>
        )}
      </View>
      <View style={styles.petInfo}>
        <Text style={[styles.petName, { color: theme.colors.textPrimary }]}>{pet.name}</Text>
        <Text style={[styles.petSpecies, { color: theme.colors.textSecondary }]}>
          {pet.species} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
        </Text>
        {pet.description && (
          <Text style={[styles.petDesc, { color: theme.colors.textTertiary }]} numberOfLines={2}>
            {pet.description}
          </Text>
        )}
        {pet.traits && pet.traits.length > 0 && (
          <View style={styles.traits}>
            {pet.traits.slice(0, 3).map((trait) => (
              <View key={trait} style={[styles.trait, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[styles.traitText, { color: theme.colors.textSecondary }]}>{trait}</Text>
              </View>
            ))}
          </View>
        )}
        <Button
          title={loading ? 'Please wait...' : adopted ? '💔 Release' : '💙 Adopt'}
          onPress={adopted ? onUnadopt : onAdopt}
          variant={adopted ? 'outline' : 'primary'}
          size="sm"
          loading={loading}
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </Card>
  );
};

const PetStoreScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [pets, setPets] = useState([]);
  const [adoptedIds, setAdoptedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'mine'

  const load = useCallback(async () => {
    try {
      const [petsRes, adoptedRes] = await Promise.all([
        petService.getAll(),
        petService.getAdopted(),
      ]);
      setPets(petsRes.data?.pets || petsRes.data || []);
      const adopted = adoptedRes.data?.pets || adoptedRes.data || [];
      setAdoptedIds(new Set(adopted.map((p) => p._id)));
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdopt = async (petId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActionLoading(petId);
    try {
      await petService.adopt(petId);
      setAdoptedIds((prev) => new Set([...prev, petId]));
      Alert.alert('🎉 Congratulations!', "You've adopted this pet! They're now part of your family.");
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to adopt pet.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnadopt = async (petId) => {
    Alert.alert('Release Pet', "Are you sure you want to release this pet?", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Release',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(petId);
          try {
            await petService.unadopt(petId);
            setAdoptedIds((prev) => { const s = new Set(prev); s.delete(petId); return s; });
          } catch (_) {}
          finally { setActionLoading(null); }
        },
      },
    ]);
  };

  const displayPets = tab === 'mine'
    ? pets.filter((p) => adoptedIds.has(p._id))
    : pets;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title={t('pets')} onBack={() => navigation.goBack()} />

      {/* Hero */}
      <LinearGradient colors={[Colors.accent, Colors.accentDark]} style={styles.hero}>
        <Text style={styles.heroEmoji}>🐾</Text>
        <View>
          <Text style={styles.heroTitle}>Virtual Pet Adoption</Text>
          <Text style={styles.heroSubtitle}>Adopt a companion, reduce loneliness</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.surfaceAlt }]}>
        {['all', 'mine'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? Colors.primary : theme.colors.textTertiary, fontWeight: tab === t ? '700' : '400' }]}>
              {t === 'all' ? t('availablePets') : `${t('myPets')} (${adoptedIds.size})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayPets}
        keyExtractor={(item) => item._id}
        numColumns={1}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={{ fontSize: 56 }}>🐾</Text>}
            title={tab === 'mine' ? 'No adopted pets yet' : 'No pets available'}
            subtitle={tab === 'mine' ? 'Adopt a pet to see them here' : 'Check back later for new pets'}
          />
        }
        renderItem={({ item }) => (
          <PetCard
            pet={item}
            adopted={adoptedIds.has(item._id)}
            loading={actionLoading === item._id}
            onAdopt={() => handleAdopt(item._id)}
            onUnadopt={() => handleUnadopt(item._id)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.white },
  heroSubtitle: { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  tabs: { flexDirection: 'row', margin: Spacing.base, borderRadius: BorderRadius.md, padding: 4 },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: Typography.fontSize.sm },
  list: { padding: Spacing.base, paddingTop: 0, gap: Spacing.md },
  petCard: { flexDirection: 'row', padding: 0, overflow: 'hidden' },
  petImageContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  petEmoji: { fontSize: 48 },
  adoptedBadge: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 2,
  },
  adoptedBadgeText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
  petInfo: { flex: 1, padding: Spacing.md },
  petName: { fontSize: Typography.fontSize.lg, fontWeight: '700', marginBottom: 4 },
  petSpecies: { fontSize: Typography.fontSize.sm, marginBottom: 6 },
  petDesc: { fontSize: Typography.fontSize.sm, lineHeight: 20, marginBottom: 8 },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  trait: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  traitText: { fontSize: Typography.fontSize.xs, fontWeight: '500' },
});

export default PetStoreScreen;
