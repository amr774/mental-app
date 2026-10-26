import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { chatService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { formatDate } from '../../utils/helpers';

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! 👋 I'm your Mindful AI companion. I'm here to support you on your wellness journey. How are you feeling today?",
  timestamp: new Date(),
};

const MessageBubble = ({ message, user }) => {
  const { theme } = useTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.botAvatarGradient}>
            <Ionicons name="leaf" size={18} color={Colors.white} />
          </LinearGradient>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: Colors.primary }]
            : [styles.botBubble, { backgroundColor: theme.colors.surface, ...Shadows.sm }],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? Colors.white : theme.colors.textPrimary },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255,255,255,0.65)' : theme.colors.textTertiary },
          ]}
        >
          {formatDate(message.timestamp, 'time')}
        </Text>
      </View>
      {isUser && <Avatar uri={user?.avatar} name={user?.name} size={36} />}
    </View>
  );
};

const TypingIndicator = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.messageRow]}>
      <View style={styles.botAvatar}>
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.botAvatarGradient}>
          <Ionicons name="leaf" size={18} color={Colors.white} />
        </LinearGradient>
      </View>
      <View style={[styles.bubble, styles.botBubble, { backgroundColor: theme.colors.surface }]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    </View>
  );
};

const ChatScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const newChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInputText('');
  };

  const deleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMessages([INITIAL_MESSAGE]);
            setInputText('');
          },
        },
      ]
    );
  };

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await chatService.sendMessage(text);
      const botContent =
        response.data?.reply ||
        response.data?.message ||
        response.data?.response ||
        "I'm here with you. Could you tell me more about how you're feeling?";

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (_) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again. I'm always here for you. 💙",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [inputText, isTyping]);

  const suggestedPrompts = [
    "I'm feeling anxious today",
    'Help me with breathing exercises',
    "I can't sleep well",
    'I need some motivation',
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={styles.botInfo}>
              <View style={styles.botAvatarHeader}>
                <Ionicons name="leaf" size={24} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.botName}>{t('aiCompanion')}</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Always here for you</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={newChat}>
                <Ionicons name="create-outline" size={22} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={deleteChat}>
                <Ionicons name="trash-outline" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} user={user} />}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
        />

        {/* Suggested Prompts (shown only at start) */}
        {messages.length === 1 && (
          <View style={styles.suggestions}>
            <Text style={[styles.suggestionsLabel, { color: theme.colors.textSecondary }]}>
              Try saying:
            </Text>
            <View style={styles.suggestionsRow}>
              {suggestedPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={[styles.suggestionChip, { backgroundColor: theme.colors.surfaceAlt }]}
                  onPress={() => setInputText(prompt)}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.textPrimary }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary, backgroundColor: theme.colors.surfaceAlt }]}
            placeholder={t('typeMessage')}
            placeholderTextColor={theme.colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
            style={[
              styles.sendBtn,
              { opacity: !inputText.trim() || isTyping ? 0.4 : 1 },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.sendBtnGradient}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  botAvatarHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  onlineText: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  messagesList: {
    padding: Spacing.base,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  botAvatarGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '72%',
    borderRadius: 18,
    padding: Spacing.md,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  suggestions: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  suggestionsLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  suggestionText: {
    fontSize: Typography.fontSize.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
