import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { withUBotService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { formatDate } from '../../utils/helpers';

const BOT_GRADIENT = ['#a78bfa', '#60a5fa'];

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi 🤍 I'm WithUBot, your empathetic companion. Tell me how you're feeling today.",
  timestamp: new Date(),
};

// ── Pet toggle card ───────────────────────────────────────────────
const PetCard = ({ pet }) => {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: 6 }}>
      <TouchableOpacity
        style={styles.petToggleBtn}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.8}
      >
        <Ionicons name="paw" size={14} color="#a78bfa" />
        <Text style={styles.petToggleText}>{open ? 'Hide companion' : 'See a companion'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={[styles.recCard, styles.petCard, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name="paw" size={22} color="#a78bfa" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <View style={styles.petNameRow}>
              <Text style={[styles.recName, { color: theme.colors.textPrimary }]}>{pet.name}</Text>
              <View style={styles.petBadge}>
                <Text style={styles.petBadgeText}>{pet.category}</Text>
              </View>
            </View>
            <Text style={[styles.recDesc, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {pet.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ── Article card ──────────────────────────────────────────────────
const ArticleCard = ({ article, theme }) => (
  <View style={[styles.recCard, { backgroundColor: theme.colors.surfaceAlt }]}>
    <Ionicons name="newspaper-outline" size={22} color={Colors.primary} style={{ marginTop: 2 }} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.recName, { color: theme.colors.textPrimary }]}>{article.name}</Text>
      <Text style={[styles.recDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {article.description}
      </Text>
    </View>
  </View>
);

// ── Message bubble ────────────────────────────────────────────────
const MessageBubble = ({ message, user }) => {
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <LinearGradient colors={BOT_GRADIENT} style={styles.botAvatar}>
          <Ionicons name="heart" size={18} color="#fff" />
        </LinearGradient>
      )}
      <View style={{ maxWidth: '72%' }}>
        {message.crisis && (
          <View style={styles.crisisBanner}>
            <Ionicons name="warning" size={14} color="#b91c1c" />
            <Text style={styles.crisisText}>Crisis Line: {message.hotline}</Text>
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: Colors.primary }]
            : [styles.botBubble, { backgroundColor: theme.colors.surface, ...Shadows.sm }],
        ]}>
          <Text style={[styles.bubbleText, { color: isUser ? '#fff' : theme.colors.textPrimary }]}>
            {message.content}
          </Text>
          <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.65)' : theme.colors.textTertiary }]}>
            {formatDate(message.timestamp, 'time')}
          </Text>
        </View>

        {/* Emotion badge */}
        {!isUser && message.emotion && message.emotion !== 'neutral' && (
          <Text style={[styles.emotionBadge, { color: theme.colors.textTertiary }]}>
            {EMOTION_EMOJI[message.emotion] || '💬'} {message.emotion}
          </Text>
        )}

        {/* Article */}
        {message.rec && <ArticleCard article={message.rec} theme={theme} />}

        {/* Pet toggle */}
        {message.petRec && <PetCard pet={message.petRec} />}
      </View>
      {isUser && <Avatar uri={user?.avatar} name={user?.name} size={36} />}
    </View>
  );
};

const EMOTION_EMOJI = { sad: '😔', anxious: '😰', angry: '😠', lonely: '😶', happy: '😊' };

// ── TypingIndicator ───────────────────────────────────────────────
const TypingIndicator = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.messageRow}>
      <LinearGradient colors={BOT_GRADIENT} style={styles.botAvatar}>
        <Ionicons name="heart" size={18} color="#fff" />
      </LinearGradient>
      <View style={[styles.bubble, styles.botBubble, { backgroundColor: theme.colors.surface }]}>
        <ActivityIndicator size="small" color="#a78bfa" />
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────
export default function WithUBotScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [messages,  setMessages]  = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const listRef = useRef(null);

  const scrollToBottom = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const newChat = () => { setMessages([INITIAL_MESSAGE]); setInputText(''); };

  const deleteChat = () => Alert.alert('Delete Chat', 'Delete this conversation?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: newChat },
  ]);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ text: m.content, sender: m.role === 'user' ? 'user' : 'bot' }));

      const res  = await withUBotService.sendMessage(text, history);
      const data = res.data || res;

      const botMsg = {
        id:        (Date.now() + 1).toString(),
        role:      'assistant',
        content:   data.reply || "I'm here for you.",
        timestamp: new Date(),
        crisis:    data.crisis,
        hotline:   data.hotline,
        emotion:   data.emotion,
        rec:       data.recommendedArticle || null,
        petRec:    data.recommendedPet     || null,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. 💙",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [inputText, isTyping, messages]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <LinearGradient colors={BOT_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.botInfo}>
              <View style={styles.botAvatarHeader}>
                <Ionicons name="heart" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.botName}>WithUBot</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Your empathetic companion</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={newChat}>
                <Ionicons name="create-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={deleteChat}>
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} user={user} />}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.surfaceAlt }]}
            placeholder="How are you feeling today?"
            placeholderTextColor={theme.colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
            style={[styles.sendBtn, { opacity: !inputText.trim() || isTyping ? 0.4 : 1 }]}
          >
            <LinearGradient colors={BOT_GRADIENT} style={styles.sendBtnGradient}>
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  botInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1, marginLeft: Spacing.sm },
  botAvatarHeader: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  botName: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: '#fff' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  onlineText: { fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' },
  messagesList: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.lg },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, marginBottom: Spacing.sm },
  messageRowUser: { flexDirection: 'row-reverse' },
  botAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: 18, padding: Spacing.md },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: Typography.fontSize.base, lineHeight: 22 },
  timestamp: { fontSize: Typography.fontSize.xs, marginTop: 4, alignSelf: 'flex-end' },
  emotionBadge: { fontSize: 11, marginTop: 4, marginLeft: 4 },
  crisisBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef2f2', borderRadius: 8,
    padding: 8, marginBottom: 4,
  },
  crisisText: { fontSize: 12, color: '#b91c1c', fontWeight: '600' },
  recCard: {
    flexDirection: 'row', gap: 10,
    borderRadius: 12, padding: 10, marginTop: 6,
  },
  petCard: { borderWidth: 1, borderColor: '#a78bfa44' },
  recName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  recDesc: { fontSize: 12, lineHeight: 17 },
  petToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#a78bfa55',
    backgroundColor: '#a78bfa18',
    borderRadius: 14, paddingVertical: 5, paddingHorizontal: 12,
  },
  petToggleText: { color: '#a78bfa', fontWeight: '600', fontSize: 12 },
  petNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  petBadge: {
    backgroundColor: '#a78bfa33', borderRadius: 6,
    paddingVertical: 1, paddingHorizontal: 6,
  },
  petBadgeText: { color: '#a78bfa', fontSize: 11, fontWeight: '600' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: Spacing.sm, borderTopWidth: 1, gap: Spacing.sm,
  },
  input: {
    flex: 1, borderRadius: 22,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base, maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  sendBtnGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
