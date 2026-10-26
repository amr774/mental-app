import React, { useState, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { isValidEmail, getErrorMessage } from '../../utils/helpers';

const LoginScreen = ({ navigation }) => {
  const { login, loginAsDemo } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Gradient */}
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </View>
            <Text style={styles.appName}>Mindful</Text>
            <Text style={styles.tagline}>Your mental wellness companion</Text>
          </LinearGradient>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to continue your wellness journey
            </Text>

            <Input
              label={t('email')}
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null })); }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Input
              ref={passwordRef}
              label={t('password')}
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
              error={errors.password}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
            >
              <Text style={[styles.forgotText, { color: Colors.primary }]}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing in...' : t('signIn')}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {/* Try Demo */}
            <TouchableOpacity
              onPress={loginAsDemo}
              style={[styles.demoBtn, { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' }]}
            >
              <Text style={styles.demoEmoji}>🎯</Text>
              <View>
                <Text style={[styles.demoTitle, { color: Colors.primary }]}>Try Demo</Text>
                <Text style={[styles.demoSub, { color: theme.colors.textTertiary }]}>Explore without account</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
                {t('dontHaveAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: Colors.primary }]}>
                  {t('signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  headerGradient: {
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['4xl'],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Spacing.xs,
  },
  formCard: {
    margin: Spacing.base,
    marginTop: -Spacing['2xl'],
    borderRadius: 24,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.base,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  loginBtn: { marginTop: Spacing.xs },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  demoEmoji: { fontSize: 24 },
  demoTitle: { fontSize: Typography.fontSize.base, fontWeight: '700' },
  demoSub: { fontSize: Typography.fontSize.xs, marginTop: 1 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: { fontSize: Typography.fontSize.base },
  registerLink: { fontSize: Typography.fontSize.base, fontWeight: '600' },
});

export default LoginScreen;
