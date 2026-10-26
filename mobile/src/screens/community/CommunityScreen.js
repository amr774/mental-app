import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { postService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { timeAgo, truncate } from '../../utils/helpers';

const PostCard = ({ post, onPress, onLike, currentUserId }) => {
  const { theme } = useTheme();
  const isLiked = post.likes?.includes(currentUserId);
  const isAnonymous = post.anonymous;
  const author = post.author || post.userId;

  return (
    <Card onPress={onPress} shadow="sm" style={styles.postCard}>
      {/* Author Row */}
      <View style={styles.authorRow}>
        {isAnonymous ? (
          <View style={[styles.anonAvatar, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="person" size={20} color={theme.colors.textTertiary} />
          </View>
        ) : (
          <Avatar uri={author?.avatar} name={author?.name} size={40} />
        )}
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: theme.colors.textPrimary }]}>
            {isAnonymous ? 'Anonymous' : author?.name || 'User'}
          </Text>
          <Text style={[styles.postTime, { color: theme.colors.textTertiary }]}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>
        {isAnonymous && (
          <View style={[styles.anonBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="eye-off-outline" size={12} color={theme.colors.textTertiary} />
            <Text style={[styles.anonText, { color: theme.colors.textTertiary }]}>Anonymous</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={[styles.postContent, { color: theme.colors.textPrimary }]}>
        {truncate(post.content, 200)}
      </Text>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.actionPill, isLiked && styles.actionPillLiked]}
          onPress={() => onLike(post._id, isLiked)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={isLiked ? Colors.error : theme.colors.textSecondary}
          />
          <Text style={[styles.actionCount, { color: isLiked ? Colors.error : theme.colors.textSecondary }]}>
            {post.likes?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionPill, { backgroundColor: theme.colors.surfaceAlt }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.actionCount, { color: theme.colors.textSecondary }]}>
            {post.comments?.length || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionPill, { backgroundColor: theme.colors.surfaceAlt }]}
          activeOpacity={0.7}
        >
          <Ionicons name="share-social-outline" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const CommunityScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await postService.getAll();
      setPosts(res.data?.posts || res.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [load, navigation]);

  const handleLike = async (postId, isLiked) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const likes = p.likes || [];
        return {
          ...p,
          likes: isLiked
            ? likes.filter((id) => id !== user._id)
            : [...likes, user._id],
        };
      })
    );
    try {
      if (isLiked) {
        await postService.unlike(postId);
      } else {
        await postService.like(postId);
      }
    } catch (_) {
      load(); // Revert by reloading
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.secondary, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>{t('community')}</Text>
            <Text style={styles.headerSubtitle}>Share & support each other</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="people-outline" size={56} color={theme.colors.textTertiary} />}
            title={t('noPosts')}
            subtitle={t('beFirst')}
            actionLabel={t('createPost')}
            onAction={() => navigation.navigate('CreatePost')}
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?._id}
            onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
            onLike={handleLike}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: Typography.fontSize['2xl'], fontWeight: '700', color: Colors.white },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.fontSize.sm, marginTop: 2 },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.base, gap: Spacing.md },
  postCard: { gap: Spacing.md },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  anonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: { flex: 1 },
  authorName: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  postTime: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  anonText: { fontSize: Typography.fontSize.xs },
  postContent: { fontSize: Typography.fontSize.base, lineHeight: 24 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  actionPillLiked: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  actionCount: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
});

export default CommunityScreen;
