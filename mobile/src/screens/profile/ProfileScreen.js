import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { userService, personalityService, moodService, petService } from '../../api/services';
import Avatar from '../../components/Avatar';
import Card from '../../components/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { getMoodEmoji, formatDate } from '../../utils/helpers';

const RESULT_META = {
  Good:     { emoji: '🌟', color: '#4ade80' },
  Calm:     { emoji: '🌿', color: '#4ecdc4' },
  Social:   { emoji: '🤝', color: '#a78bfa' },
  Anxious:  { emoji: '🧘', color: '#f87171' },
  Sad:      { emoji: '💙', color: '#60a5fa' },
  Lonely:   { emoji: '🤝', color: '#a78bfa' },
  Stressed: { emoji: '🧘', color: '#f87171' },
};
const PET_EMOJI = { cat:'🐱', dog:'🐶', bird:'🐦', fish:'🐠', rabbit:'🐰', hamster:'🐹', turtle:'🐢' };

const SectionTitle = ({ title, theme }) => (
  <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{title.toUpperCase()}</Text>
);

const InfoRow = ({ label, value, theme }) => (
  <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
    <Text style={[styles.infoKey, { color: theme.colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.infoVal, { color: theme.colors.textPrimary }]}>{value}</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser, isAdmin } = useAuth();
  const { theme, mode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const [personalityResult, setPersonalityResult] = useState(null);
  const [recentMoods, setRecentMoods] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    personalityService.getMyResult().then(res => {
      // res.data may be { result, description } or the result string directly
      const data = res.data;
      setPersonalityResult(typeof data === 'string' ? { result: data } : data);
    }).catch(() => {});

    moodService.getHistory().then(res => {
      const moods = res.data?.moods || res.data || [];
      setRecentMoods(moods.slice(0, 7));
    }).catch(() => {});

    petService.getAdopted().then(res => {
      setAdoptedPets(res.data?.pets || res.data || []);
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await userService.updateProfile({ name: editName.trim() });
      await refreshUser();
      setEditing(false);
    } catch (_) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' });
      try {
        await userService.uploadAvatar(formData);
        await refreshUser();
      } catch (_) {
        Alert.alert('Error', 'Failed to upload photo.');
      }
    }
  };

  // Direct logout — matches web behavior (no confirm dialog that breaks on browser)
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const apiBase = process.env.EXPO_PUBLIC_API_URL || '';
  const avatarUri = user?.avatar
    ? user.avatar.startsWith('http') ? user.avatar : `${apiBase}/${user.avatar}`
    : null;

  const resultMeta = personalityResult?.result ? RESULT_META[personalityResult.result] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ── */}
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.hero}>
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
            <Avatar uri={avatarUri} name={user?.name} size={88} />
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{user?.name || 'User'}</Text>
            <Text style={styles.heroEmail}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              {isAdmin && <Ionicons name="shield-checkmark" size={12} color={Colors.white} />}
              <Text style={styles.roleBadgeText}>{isAdmin ? 'Admin' : 'Member'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => { setEditing(e => !e); setEditName(user?.name || ''); }}
          >
            <Text style={styles.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>

          {/* ── Edit Form ── */}
          {editing && (
            <Card style={styles.card}>
              <SectionTitle title="Edit Profile" theme={theme} />
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Display Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  maxLength={50}
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: Colors.primary }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* ── Last Assessment ── */}
          <Card style={styles.card}>
            <SectionTitle title="Last Assessment" theme={theme} />
            {resultMeta ? (
              <View style={[styles.resultRow, { borderLeftColor: resultMeta.color }]}>
                <Text style={styles.resultEmoji}>{resultMeta.emoji}</Text>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: theme.colors.textPrimary }]}>
                    {personalityResult.result}
                  </Text>
                  {personalityResult.description && (
                    <Text style={[styles.resultHint, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {personalityResult.description}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'PersonalityTest' })}>
                <Text style={[styles.emptyHint, { color: theme.colors.textTertiary }]}>
                  Take the{' '}
                  <Text style={{ color: Colors.primary }}>Emotional Test</Text>
                  {' '}to see your result
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* ── Recent Moods ── */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <SectionTitle title="Recent Moods" theme={theme} />
              <TouchableOpacity onPress={() => navigation.navigate('MoodTab', { screen: 'MoodHistory' })}>
                <Text style={[styles.seeAll, { color: Colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentMoods.length === 0 ? (
              <Text style={[styles.emptyHint, { color: theme.colors.textTertiary }]}>
                No moods logged yet
              </Text>
            ) : (
              <View style={styles.moodList}>
                {recentMoods.map((m, i) => (
                  <View key={i} style={[styles.moodRow, { borderBottomColor: theme.colors.border }]}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(m.value || m.mood)}</Text>
                    <Text style={[styles.moodDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(m.createdAt || m.date, 'short')}
                    </Text>
                    {m.note ? (
                      <Text style={[styles.moodNote, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                        {m.note}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* ── Account Info ── */}
          <Card style={styles.card}>
            <SectionTitle title="Account" theme={theme} />
            <InfoRow label="Name" value={user?.name || '—'} theme={theme} />
            <InfoRow label="Email" value={user?.email || '—'} theme={theme} />
            <InfoRow label="Role" value={user?.role || 'user'} theme={theme} />
            <InfoRow label="Status" value="Active ✓" theme={theme} />
          </Card>

          {/* ── Adopted Pets ── */}
          {adoptedPets.length > 0 && (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <SectionTitle title="🏠 Adopted Pets" theme={theme} />
                <TouchableOpacity onPress={() => navigation.navigate('HomeTab', { screen: 'PetStore' })}>
                  <Text style={[styles.seeAll, { color: Colors.primary }]}>View all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.petGrid}>
                {adoptedPets.map((pet) => (
                  <View key={pet._id} style={[styles.petItem, { backgroundColor: theme.colors.surfaceAlt, borderColor: Colors.secondary + '40' }]}>
                    <Text style={styles.petItemEmoji}>{PET_EMOJI[pet.type?.toLowerCase() || pet.species?.toLowerCase()] || '🐾'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.petItemName, { color: theme.colors.textPrimary }]}>{pet.name}</Text>
                      <Text style={[styles.petItemType, { color: theme.colors.textTertiary }]}>{pet.species || pet.type}</Text>
                    </View>
                    <View style={[styles.adoptedBadge, { backgroundColor: Colors.secondary + '20' }]}>
                      <Text style={[styles.adoptedBadgeText, { color: Colors.secondary }]}>✓ Adopted</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* ── Settings ── */}
          <Card style={styles.card}>
            <SectionTitle title="Settings" theme={theme} />

            {/* Dark Mode */}
            <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.secondary + '20' }]}>
                  <Ionicons name="moon-outline" size={18} color={Colors.secondary} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Dark Mode</Text>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
                trackColor={{ false: theme.colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {/* Language */}
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name="language-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Language</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.colors.textTertiary }]}>
                  {language === 'en' ? 'English' : 'العربية'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </View>
            </TouchableOpacity>

            {/* My Orders */}
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => navigation.navigate('MyOrders')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.amber + '22' }]}>
                  <Ionicons name="receipt-outline" size={18} color={Colors.amber} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>My Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>

            {/* Admin Dashboard */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
                onPress={() => navigation.navigate('HomeTab', { screen: 'Admin' })}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '20' }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Admin Dashboard</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            )}

            {/* Logout */}
            <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: Colors.error + '15' }]}>
                  <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                </View>
                <Text style={[styles.settingLabel, { color: Colors.error }]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.error + '80'} />
            </TouchableOpacity>
          </Card>

          <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
            Mindful v1.0.0 • Made with 💙
          </Text>
          <View style={{ height: Spacing['3xl'] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: { position: 'relative' },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  heroInfo: { flex: 1 },
  heroName: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.white },
  heroEmail: { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  roleBadgeText: { color: Colors.white, fontSize: Typography.fontSize.xs, fontWeight: '700' },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editBtnText: { color: Colors.white, fontSize: Typography.fontSize.sm, fontWeight: '600' },
  content: { padding: Spacing.base, gap: Spacing.md },
  card: { marginBottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  seeAll: { fontSize: Typography.fontSize.sm, fontWeight: '600', marginBottom: Spacing.md },

  // Edit form
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: Typography.fontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  saveBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSize.base },

  // Assessment
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.md,
    borderLeftWidth: 3,
    borderRadius: 2,
  },
  resultEmoji: { fontSize: 36 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: Typography.fontSize.lg, fontWeight: '700' },
  resultHint: { fontSize: Typography.fontSize.sm, marginTop: 2, lineHeight: 18 },
  emptyHint: { fontSize: Typography.fontSize.sm, lineHeight: 20 },

  // Moods
  moodList: { gap: 0 },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  moodEmoji: { fontSize: 22, width: 30, textAlign: 'center' },
  moodDate: { fontSize: Typography.fontSize.sm, width: 60 },
  moodNote: { flex: 1, fontSize: Typography.fontSize.sm },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  infoKey: { fontSize: Typography.fontSize.sm },
  infoVal: { fontSize: Typography.fontSize.sm, fontWeight: '600', textTransform: 'capitalize' },

  // Pets
  petGrid: { gap: Spacing.sm },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  petItemEmoji: { fontSize: 28 },
  petItemName: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  petItemType: { fontSize: Typography.fontSize.xs, textTransform: 'capitalize', marginTop: 2 },
  adoptedBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  adoptedBadgeText: { fontSize: Typography.fontSize.xs, fontWeight: '700' },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontSize: Typography.fontSize.base, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: Typography.fontSize.sm },

  version: { textAlign: 'center', fontSize: Typography.fontSize.xs, marginTop: Spacing.md },
});

export default ProfileScreen;
