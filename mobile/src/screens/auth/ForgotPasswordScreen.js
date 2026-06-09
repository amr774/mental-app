import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Colors, Typography, Spacing } from '../../theme';
import { isValidEmail, getErrorMessage } from '../../utils/helpers';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return setError('Email is required');
    if (!isValidEmail(email)) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: Colors.accentLight }]}>
            <Ionicons name="mail-open" size={48} color={Colors.accent} />
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>
            Check your inbox!
          </Text>
          <Text style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}>
            We've sent a password reset link to{'\n'}
            <Text style={{ color: Colors.primary, fontWeight: '600' }}>{email}</Text>
          </Text>
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: Spacing['2xl'] }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={[styles.icon, { backgroundColor: Colors.primaryLight + '30' }]}>
              <Ionicons name="key-outline" size={48} color={Colors.primary} />
            </View>

            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Forgot Password?
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              No worries! Enter your email address and we'll send you a reset link.
            </Text>

            <Input
              label={t('email')}
              placeholder="your@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSend}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
              style={{ marginTop: Spacing.xl }}
            />

            <Button
              title={loading ? 'Sending...' : t('sendResetLink')}
              onPress={handleSend}
              loading={loading}
              style={{ marginTop: Spacing.sm }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={[styles.loginLinkText, { color: Colors.primary }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  backBtn: {
    margin: Spacing.base,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: 6,
  },
  loginLinkText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  successSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 26,
  },
});

export default ForgotPasswordScreen;
