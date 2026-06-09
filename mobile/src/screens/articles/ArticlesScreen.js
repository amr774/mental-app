import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { articleService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { truncate, formatDate } from '../../utils/helpers';

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Sleep', 'Stress', 'Mindfulness', 'Self-Care'];

const ArticlesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const load = useCallback(async () => {
    try {
      const res = await articleService.getAll();
      setArticles(res.data?.articles || res.data || []);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title={t('articles')} onBack={() => navigation.goBack()} />

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceAlt, margin: Spacing.base, marginTop: 0 }]}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder={t('search')}
          placeholderTextColor={theme.colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item;
          return (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryChip,
                isSelected
                  ? { backgroundColor: Colors.primary }
                  : { backgroundColor: theme.colors.surfaceAlt },
              ]}
            >
              <Text style={[styles.categoryText, { color: isSelected ? Colors.white : theme.colors.textSecondary }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="newspaper-outline" size={56} color={theme.colors.textTertiary} />}
            title={t('noArticles')}
            subtitle="No articles match your search."
          />
        }
        renderItem={({ item, index }) => {
          const colors = [
            [Colors.primary, Colors.secondary],
            [Colors.secondary, Colors.accent],
            [Colors.accent, Colors.accentDark],
            [Colors.warning, Colors.error],
          ];
          const gradientColors = colors[index % colors.length];
          return (
            <Card onPress={() => navigation.navigate('ArticleDetail', { article: item })} style={styles.articleCard} shadow="md">
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.articleGradient}
              >
                <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.9)" />
              </LinearGradient>
              <View style={styles.articleInfo}>
                {item.category && (
                  <View style={[styles.categoryTag, { backgroundColor: gradientColors[0] + '15' }]}>
                    <Text style={[styles.categoryTagText, { color: gradientColors[0] }]}>
                      {item.category}
                    </Text>
                  </View>
                )}
                <Text style={[styles.articleTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.articleExcerpt, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {truncate(item.summary || item.content, 100)}
                </Text>
                <View style={styles.articleMeta}>
                  <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                    {formatDate(item.createdAt, 'short')}
                  </Text>
                  <Text style={[styles.readMore, { color: Colors.primary }]}>
                    {t('readMore')} →
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: Typography.fontSize.base },
  categories: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, gap: Spacing.sm },
  categoryChip: { paddingVertical: 8, paddingHorizontal: Spacing.base, borderRadius: BorderRadius.full },
  categoryText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  list: { padding: Spacing.base, gap: Spacing.md },
  articleCard: { flexDirection: 'row', gap: Spacing.md, padding: 0, overflow: 'hidden' },
  articleGradient: { width: 80, alignItems: 'center', justifyContent: 'center' },
  articleInfo: { flex: 1, padding: Spacing.md },
  categoryTag: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full, marginBottom: 6 },
  categoryTagText: { fontSize: Typography.fontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  articleTitle: { fontSize: Typography.fontSize.base, fontWeight: '700', marginBottom: 4, lineHeight: 22 },
  articleExcerpt: { fontSize: Typography.fontSize.sm, lineHeight: 20, marginBottom: 8 },
  articleMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { fontSize: Typography.fontSize.xs },
  readMore: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
});

export default ArticlesScreen;
