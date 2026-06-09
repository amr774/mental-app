import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const CreatePostScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }
    setLoading(true);
    try {
      await postService.create({ content: content.trim(), anonymous });
      navigation.goBack();
    } catch (_) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title={t('createPost')}
          onBack={() => navigation.goBack()}
          rightAction={
            <Button
              title={loading ? 'Posting...' : 'Post'}
              onPress={handlePost}
              loading={loading}
              size="sm"
              fullWidth={false}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Author Preview */}
          <View style={styles.authorPreview}>
            {anonymous ? (
              <View style={[styles.anonAvatar, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={styles.anonEmoji}>🎭</Text>
              </View>
            ) : (
              <Avatar uri={user?.avatar} name={user?.name} size={48} />
            )}
            <View>
              <Text style={[styles.authorName, { color: theme.colors.textPrimary }]}>
                {anonymous ? 'Anonymous' : user?.name}
              </Text>
              <Text style={[styles.postingAs, { color: theme.colors.textTertiary }]}>
                Posting to Community
              </Text>
            </View>
          </View>

          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary }]}
            placeholder="Share your thoughts, feelings, or experiences... Your words might help someone today."
            placeholderTextColor={theme.colors.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
            maxLength={2000}
          />

          <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>
            {content.length}/2000
          </Text>

          {/* Anonymous Toggle */}
          <View style={[styles.anonToggle, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={styles.anonInfo}>
              <Text style={[styles.anonLabel, { color: theme.colors.textPrimary }]}>
                {t('anonymous')}
              </Text>
              <Text style={[styles.anonHint, { color: theme.colors.textTertiary }]}>
                Your name won't be shown on this post
              </Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: theme.colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { padding: Spacing.base, flex: 1 },
  authorPreview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  anonAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  anonEmoji: { fontSize: 24 },
  authorName: { fontSize: Typography.fontSize.base, fontWeight: '700' },
  postingAs: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  input: { fontSize: Typography.fontSize.base, lineHeight: 26, minHeight: 200 },
  charCount: { fontSize: Typography.fontSize.xs, textAlign: 'right', marginTop: Spacing.sm },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  anonInfo: { flex: 1, marginRight: Spacing.md },
  anonLabel: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  anonHint: { fontSize: Typography.fontSize.xs, marginTop: 2 },
});

export default CreatePostScreen;
