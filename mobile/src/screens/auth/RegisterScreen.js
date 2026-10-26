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
import { Colors, Typography, Spacing } from '../../theme';
import { isValidEmail, getErrorMessage } from '../../utils/helpers';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      const msg = getErrorMessage(err);
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => setErrors((e) => ({ ...e, [field]: null }));

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
          {/* Header */}
          <LinearGradient
            colors={[Colors.secondary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={{ fontSize: 44 }}>🧠</Text>
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>Start your wellness journey today</Text>
            </View>
          </LinearGradient>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <Input
              label={t('name')}
              placeholder="Your full name"
              value={name}
              onChangeText={(v) => { setName(v); clearError('name'); }}
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Input
              ref={emailRef}
              label={t('email')}
              placeholder="you@example.com"
              value={email}
              onChangeText={(v) => { setEmail(v); clearError('email'); }}
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
              placeholder="Min 6 characters"
              value={password}
              onChangeText={(v) => { setPassword(v); clearError('password'); }}
              error={errors.password}
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Input
              ref={confirmRef}
              label={t('confirmPassword')}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
              error={errors.confirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <View style={styles.terms}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.textTertiary} />
              <Text style={[styles.termsText, { color: theme.colors.textTertiary }]}>
                By creating an account you agree to our Terms of Service and Privacy Policy.
              </Text>
            </View>

            <Button
              title={loading ? 'Creating account...' : t('signUp')}
              onPress={handleRegister}
              loading={loading}
              style={styles.registerBtn}
            />

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                {t('alreadyHaveAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: Colors.primary }]}>
                  {t('signIn')}
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
  header: {
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['4xl'],
    paddingHorizontal: Spacing.base,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  headerSubtitle: {
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
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
    gap: 6,
  },
  termsText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
  registerBtn: { marginTop: Spacing.xs },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  loginText: { fontSize: Typography.fontSize.base },
  loginLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default RegisterScreen;
