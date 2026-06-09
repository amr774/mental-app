import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { postService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { timeAgo } from '../../utils/helpers';

const PostDetailScreen = ({ navigation, route }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      const res = await postService.getOne(postId);
      setPost(res.data?.post || res.data);
    } catch (_) {
      Alert.alert('Error', 'Could not load post.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLike = async () => {
    const isLiked = post?.likes?.includes(user?._id);
    setPost((p) => ({
      ...p,
      likes: isLiked
        ? p.likes.filter((id) => id !== user._id)
        : [...(p.likes || []), user._id],
    }));
    try {
      if (isLiked) await postService.unlike(postId);
      else await postService.like(postId);
    } catch (_) { load(); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const res = await postService.addComment(postId, { content: comment.trim() });
      const newComment = res.data?.comment || res.data;
      setPost((p) => ({ ...p, comments: [...(p.comments || []), newComment] }));
      setComment('');
    } catch (_) {
      Alert.alert('Error', 'Failed to add comment.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Delete comment?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await postService.deleteComment(postId, commentId);
            setPost((p) => ({
              ...p,
              comments: p.comments.filter((c) => c._id !== commentId),
            }));
          } catch (_) {}
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return null;

  const isLiked = post.likes?.includes(user?._id);

  const header = (
    <View style={styles.postSection}>
      {/* Author */}
      <View style={styles.authorRow}>
        {post.anonymous ? (
          <View style={[styles.anonAvatar, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="person" size={24} color={theme.colors.textTertiary} />
          </View>
        ) : (
          <Avatar uri={post.author?.avatar} name={post.author?.name} size={48} />
        )}
        <View>
          <Text style={[styles.authorName, { color: theme.colors.textPrimary }]}>
            {post.anonymous ? 'Anonymous' : post.author?.name}
          </Text>
          <Text style={[styles.postTime, { color: theme.colors.textTertiary }]}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* Post content */}
      <Text style={[styles.postContent, { color: theme.colors.textPrimary }]}>
        {post.content}
      </Text>

      {/* Like row */}
      <View style={[styles.likeRow, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? Colors.error : theme.colors.textSecondary} />
          <Text style={[styles.likeCount, { color: theme.colors.textSecondary }]}>
            {post.likes?.length || 0} likes
          </Text>
        </TouchableOpacity>
        <Text style={[styles.commentCount, { color: theme.colors.textTertiary }]}>
          {post.comments?.length || 0} comments
        </Text>
      </View>

      <Text style={[styles.commentsLabel, { color: theme.colors.textSecondary }]}>
        Comments
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Post" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <FlatList
          data={post.comments || []}
          keyExtractor={(item, idx) => item._id || idx.toString()}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isOwn = item.author?._id === user?._id || item.author === user?._id;
            return (
              <View style={styles.commentItem}>
                <Avatar uri={item.author?.avatar} name={item.author?.name || 'User'} size={36} />
                <View style={[styles.commentBubble, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: theme.colors.textPrimary }]}>
                      {item.author?.name || 'User'}
                    </Text>
                    <Text style={[styles.commentTime, { color: theme.colors.textTertiary }]}>
                      {timeAgo(item.createdAt)}
                    </Text>
                    {isOwn && (
                      <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
                        <Ionicons name="close" size={16} color={theme.colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[styles.commentContent, { color: theme.colors.textPrimary }]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Comment Input */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <Avatar uri={user?.avatar} name={user?.name} size={36} />
          <TextInput
            ref={inputRef}
            style={[styles.commentInput, { color: theme.colors.textPrimary, backgroundColor: theme.colors.surfaceAlt }]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={!comment.trim() || sending}
            style={{ opacity: !comment.trim() || sending ? 0.4 : 1 }}
          >
            <Ionicons name="send" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: { padding: Spacing.base, paddingBottom: Spacing.xl },
  postSection: { marginBottom: Spacing.xl },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.base },
  anonAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: Typography.fontSize.base, fontWeight: '700' },
  postTime: { fontSize: Typography.fontSize.xs, marginTop: 2 },
  postContent: { fontSize: Typography.fontSize.base, lineHeight: 26, marginBottom: Spacing.base },
  likeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, borderTopWidth: 1, marginBottom: Spacing.base },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  likeCount: { fontSize: Typography.fontSize.sm, fontWeight: '500' },
  commentCount: { fontSize: Typography.fontSize.sm },
  commentsLabel: { fontSize: Typography.fontSize.base, fontWeight: '700', marginBottom: Spacing.sm },
  commentItem: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  commentBubble: { flex: 1, borderRadius: BorderRadius.md, padding: Spacing.md },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
  commentAuthor: { fontWeight: '600', fontSize: Typography.fontSize.sm, flex: 1 },
  commentTime: { fontSize: Typography.fontSize.xs },
  commentContent: { fontSize: Typography.fontSize.sm, lineHeight: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, borderTopWidth: 1, gap: Spacing.sm },
  commentInput: { flex: 1, borderRadius: 20, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: Typography.fontSize.base, maxHeight: 100 },
});

export default PostDetailScreen;
