import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { userService } from '../../api/services';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const SettingRow = ({ icon, label, value, onPress, rightElement, destructive = false }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? Colors.error + '15' : theme.colors.surfaceAlt }]}>
        <Ionicons name={icon} size={20} color={destructive ? Colors.error : Colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? Colors.error : theme.colors.textPrimary }]}>
        {label}
      </Text>
      {value ? <Text style={[styles.settingValue, { color: theme.colors.textTertiary }]}>{value}</Text> : null}
      {rightElement || (onPress && !rightElement ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} /> : null)}
    </TouchableOpacity>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser, isAdmin } = useAuth();
  const { theme, mode, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await userService.updateProfile({ name: name.trim() });
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
      formData.append('avatar', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });
      try {
        await userService.uploadAvatar(formData);
        await refreshUser();
        Alert.alert('Success', 'Profile photo updated!');
      } catch (_) {
        Alert.alert('Error', 'Failed to upload photo.');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const toggleDarkMode = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const apiBase = process.env.EXPO_PUBLIC_API_URL || '';
  const avatarUri = user?.avatar
    ? user.avatar.startsWith('http') ? user.avatar : `${apiBase}/${user.avatar}`
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.header}
        >
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
            <Avatar uri={avatarUri} name={user?.name} size={96} />
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {editing ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={50}
              />
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
                <Ionicons name="checkmark" size={24} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditing(false); setName(user?.name || ''); }}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Ionicons name="pencil" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}

          <Text style={styles.userEmail}>{user?.email}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </LinearGradient>

        {/* Wellness Journey */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            My Journey
          </Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'journal-outline', label: 'Journal', onPress: () => navigation.navigate('HomeTab', { screen: 'Journal' }) },
              { icon: 'flag-outline', label: 'Goals', onPress: () => navigation.navigate('HomeTab', { screen: 'Goals' }) },
              { icon: 'paw-outline', label: 'My Pets', onPress: () => navigation.navigate('HomeTab', { screen: 'PetStore' }) },
              { icon: 'bag-outline', label: 'Store', onPress: () => navigation.navigate('HomeTab', { screen: 'Store' }) },
              { icon: 'person-outline', label: 'Personality', onPress: () => navigation.navigate('HomeTab', { screen: 'PersonalityTest' }) },
              { icon: 'flower-outline', label: 'Breathe', onPress: () => navigation.navigate('HomeTab', { screen: 'Breathe' }) },
            ].map((item) => (
              <TouchableOpacity key={item.label} onPress={item.onPress} style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name={item.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <Card style={[styles.section, styles.settingsCard]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings')}</Text>

          <SettingRow
            icon="moon-outline"
            label={t('darkMode')}
            rightElement={
              <Switch
                value={mode === 'dark'}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <SettingRow
            icon="language-outline"
            label={t('language')}
            value={language === 'en' ? 'English' : 'العربية'}
            onPress={toggleLanguage}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          {isAdmin && (
            <>
              <SettingRow
                icon="shield-checkmark-outline"
                label="Admin Dashboard"
                onPress={() => navigation.navigate('HomeTab', { screen: 'Admin' })}
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </>
          )}

          <SettingRow
            icon="log-out-outline"
            label={t('logout')}
            onPress={handleLogout}
            destructive
          />
        </Card>

        {/* App Version */}
        <Text style={[styles.version, { color: theme.colors.textTertiary }]}>
          Mindful v1.0.0 • Made with 💙
        </Text>
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  nameInput: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    paddingBottom: 4,
    minWidth: 120,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  adminBadgeText: { color: Colors.white, fontSize: Typography.fontSize.xs, fontWeight: '700' },
  section: { padding: Spacing.base, marginHorizontal: Spacing.base, marginTop: Spacing.xl },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', marginBottom: Spacing.base },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: { fontSize: Typography.fontSize.xs, fontWeight: '500', textAlign: 'center' },
  settingsCard: { padding: Spacing.base },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, fontSize: Typography.fontSize.base, fontWeight: '500' },
  settingValue: { fontSize: Typography.fontSize.sm },
  divider: { height: 1, marginLeft: 52 },
  version: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xl,
  },
});

export default ProfileScreen;
