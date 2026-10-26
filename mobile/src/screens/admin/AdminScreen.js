import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  Alert, RefreshControl, TextInput, Image, Modal, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  adminService, articleService, petService, storeService, orderService,
} from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatDate } from '../../utils/helpers';

const ART_CATEGORIES = ['Mental Health', 'Anxiety', 'Depression', 'Mindfulness', 'Self-Care', 'Other'];
const PET_TYPES      = ['cat', 'dog', 'bird', 'fish', 'rabbit', 'hamster', 'turtle'];
const PET_PERS       = ['Calm', 'Social', 'Anxious', 'Playful', 'Gentle'];
const STORE_CATS     = ['general', 'books', 'electronics', 'toys', 'accessories', 'wellness', 'fitness', 'other'];
const STORE_CONDS    = ['new', 'like-new', 'good', 'fair'];
const COND_COLORS    = { new: '#4ade80', 'like-new': '#4ecdc4', good: '#94a3b8', fair: '#fbbf24' };

const STATUS_COLORS = {
  pending:   { bg: 'rgba(251,191,36,0.15)',  color: '#d97706' },
  confirmed: { bg: 'rgba(78,205,196,0.15)',  color: '#0d9488' },
  cancelled: { bg: 'rgba(248,113,113,0.15)', color: '#dc2626' },
  delivered: { bg: 'rgba(74,222,128,0.15)',  color: '#16a34a' },
};

const TABS = [
  { key: 'overview',    label: 'Overview',    icon: 'grid-outline' },
  { key: 'orders',      label: 'Orders',      icon: 'cart-outline' },
  { key: 'articles',    label: 'Articles',    icon: 'newspaper-outline' },
  { key: 'pets',        label: 'Pets',        icon: 'paw-outline' },
  { key: 'store',       label: 'Store',       icon: 'bag-outline' },
  { key: 'users',       label: 'Users',       icon: 'people-outline' },
  { key: 'personality', label: 'Personality', icon: 'bulb-outline' },
];

// ─── Mini components ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, color, theme }) => (
  <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value ?? '–'}</Text>
    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
  </View>
);

const SectionLabel = ({ children, theme }) => (
  <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{children}</Text>
);

const ErrBanner = ({ msg, theme }) =>
  msg ? (
    <View style={[styles.errBanner, { backgroundColor: Colors.error + '18', borderColor: Colors.error + '40' }]}>
      <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
      <Text style={[styles.errText, { color: Colors.error }]}>{msg}</Text>
    </View>
  ) : null;

// ─── Select picker (bottom sheet) ────────────────────────────────────────────

const SelectInput = ({ value, options, onChange, theme }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ color: theme.colors.textPrimary, fontSize: 13 }}>{value || '— select —'}</Text>
        <Ionicons name="chevron-down" size={14} color={theme.colors.textTertiary} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={[styles.pickerSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.pickerHandle} />
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.pickerOpt, value === opt && { backgroundColor: Colors.primary + '20' }]}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text style={{ color: value === opt ? Colors.primary : theme.colors.textPrimary, fontWeight: value === opt ? '700' : '400', fontSize: 14 }}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

const AdminScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [tab, setTab]               = useState('overview');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState('');

  const [stats, setStats]                         = useState(null);
  const [articles, setArticles]                   = useState([]);
  const [users, setUsers]                         = useState([]);
  const [pets, setPets]                           = useState([]);
  const [storeItems, setStoreItems]               = useState([]);
  const [orders, setOrders]                       = useState([]);
  const [personalityResults, setPersonalityResults] = useState([]);

  // Article form
  const [artTitle,   setArtTitle]   = useState('');
  const [artContent, setArtContent] = useState('');
  const [artCat,     setArtCat]     = useState('Mental Health');
  const [editArt,    setEditArt]    = useState(null);

  // Pet form
  const EMPTY_PET = { name: '', type: 'cat', personality: '', description: '', image: '', price: '', contact: '', status: 'available' };
  const [petForm, setPetForm] = useState(EMPTY_PET);
  const [editPet, setEditPet] = useState(null);

  // Store form
  const EMPTY_STORE = { title: '', description: '', price: '', category: 'general', condition: 'new', image: '', contact: 'mindfulstore@support.com' };
  const [storeForm, setStoreForm] = useState(EMPTY_STORE);
  const [editStore, setEditStore] = useState(null);

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        adminService.getStats(),
        adminService.getUsers(),
        articleService.getAll({ limit: 100 }),
        petService.getAll(),
        adminService.getAllStoreItems(),
        orderService.getAll(),
        adminService.getPersonalityResults(),
      ]);
      const [statsR, usersR, artR, petR, storeR, ordersR, persR] = results;
      if (statsR.status === 'fulfilled') { const d = statsR.value?.data; setStats(d?.stats || d); }
      if (usersR.status === 'fulfilled') { const d = usersR.value?.data; setUsers(d?.users || (Array.isArray(d) ? d : [])); }
      if (artR.status === 'fulfilled')   { const d = artR.value?.data;   setArticles(Array.isArray(d) ? d : d?.items || []); }
      if (petR.status === 'fulfilled')   { const d = petR.value?.data;   setPets(Array.isArray(d) ? d : []); }
      if (storeR.status === 'fulfilled') { const d = storeR.value?.data; setStoreItems(Array.isArray(d) ? d : []); }
      if (ordersR.status === 'fulfilled'){ const d = ordersR.value?.data; setOrders(Array.isArray(d) ? d : []); }
      if (persR.status === 'fulfilled')  { const d = persR.value?.data;  setPersonalityResults(Array.isArray(d) ? d : d?.results || []); }
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  const onRefresh = () => { setRefreshing(true); loadAll(); };

  // ── Article actions ──────────────────────────────────────────────────────
  const addArticle = async () => {
    if (!artTitle.trim()) return;
    setError('');
    try {
      const res = await articleService.create({ title: artTitle, content: artContent, category: artCat });
      const a = res?.data || res;
      setArticles(prev => [...prev, a]);
      setArtTitle(''); setArtContent(''); setArtCat('Mental Health');
    } catch (e) { setError(e?.message || 'Failed to create article'); }
  };

  const saveArticle = async () => {
    if (!editArt) return;
    setError('');
    try {
      const res = await articleService.update(editArt.id, { title: editArt.title, content: editArt.content, category: editArt.category });
      const updated = res?.data || res;
      setArticles(prev => prev.map(a => (a._id || a.id) === editArt.id ? { ...a, ...updated } : a));
      setEditArt(null);
    } catch (e) { setError(e?.message || 'Failed to update article'); }
  };

  const deleteArticle = (id) => {
    Alert.alert('Delete Article', 'Delete this article?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setError('');
        try {
          await articleService.remove(id);
          setArticles(prev => prev.filter(a => (a._id || a.id) !== id));
        } catch (e) { setError(e?.message || 'Failed to delete'); }
      }},
    ]);
  };

  // ── Pet actions ──────────────────────────────────────────────────────────
  const addPet = async () => {
    if (!petForm.name.trim()) return;
    setError('');
    try {
      const res = await petService.create({ ...petForm, price: Number(petForm.price) || 0 });
      const p = res?.data || res;
      setPets(prev => [...prev, p]);
      setPetForm(EMPTY_PET);
    } catch (e) { setError(e?.message || 'Failed to create pet'); }
  };

  const savePet = async () => {
    if (!editPet) return;
    setError('');
    try {
      const id = editPet._id || editPet.id;
      const res = await petService.update(id, { ...editPet, price: Number(editPet.price) || 0 });
      const updated = res?.data || res;
      setPets(prev => prev.map(p => (p._id || p.id) === id ? updated : p));
      setEditPet(null);
    } catch (e) { setError(e?.message || 'Failed to update pet'); }
  };

  const deletePet = (id) => {
    Alert.alert('Delete Pet', 'Delete this pet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setError('');
        try {
          await petService.remove(id);
          setPets(prev => prev.filter(p => (p._id || p.id) !== id));
        } catch (e) { setError(e?.message || 'Failed to delete'); }
      }},
    ]);
  };

  // ── Store actions ────────────────────────────────────────────────────────
  const addStoreItem = async () => {
    if (!storeForm.title.trim() || !storeForm.price) return;
    setError('');
    try {
      const res = await adminService.createStoreItem({ ...storeForm, price: Number(storeForm.price) });
      const item = res?.data || res;
      setStoreItems(prev => [item, ...prev]);
      setStoreForm(EMPTY_STORE);
    } catch (e) { setError(e?.message || 'Failed to add item'); }
  };

  const saveStoreItem = async () => {
    if (!editStore) return;
    setError('');
    try {
      const id = editStore._id || editStore.id;
      const res = await storeService.update(id, { ...editStore, price: Number(editStore.price) });
      const updated = res?.data || res;
      setStoreItems(prev => prev.map(i => (i._id || i.id) === id ? updated : i));
      setEditStore(null);
    } catch (e) { setError(e?.message || 'Failed to update item'); }
  };

  const deleteStoreItem = (id) => {
    Alert.alert('Delete Item', 'Delete this store item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setError('');
        try {
          await storeService.remove(id);
          setStoreItems(prev => prev.filter(i => (i._id || i.id) !== id));
        } catch (e) { setError(e?.message || 'Failed to delete'); }
      }},
    ]);
  };

  const markStoreSold = async (id) => {
    setError('');
    try {
      await storeService.markSold(id);
      setStoreItems(prev => prev.map(i => (i._id || i.id) === id ? { ...i, status: 'sold' } : i));
    } catch (e) { setError(e?.message || 'Failed to mark sold'); }
  };

  const markStoreAvailable = async (id) => {
    setError('');
    try {
      const res = await storeService.update(id, { status: 'available' });
      const updated = res?.data || res;
      setStoreItems(prev => prev.map(i => (i._id || i.id) === id ? updated : i));
    } catch (e) { setError(e?.message || 'Failed to restock'); }
  };

  // ── User actions ─────────────────────────────────────────────────────────
  const deleteUser = (id, name) => {
    Alert.alert('Delete User', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setError('');
        try {
          await adminService.deleteUser(id);
          setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
        } catch (e) { setError(e?.message || 'Failed to delete user'); }
      }},
    ]);
  };

  // ── Order actions ────────────────────────────────────────────────────────
  const updateOrderStatus = async (id, status) => {
    setError('');
    try {
      await orderService.updateStatus(id, status);
      setOrders(prev => prev.map(o => (o._id || o.id) === id ? { ...o, status } : o));
    } catch (e) { setError(e?.message || 'Failed to update order'); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { label: 'Total Users',    value: stats?.totalUsers    ?? users.length,              icon: 'people-outline',    color: '#4ecdc4' },
    { label: 'Total Articles', value: stats?.totalArticles ?? articles.length,           icon: 'newspaper-outline', color: '#a78bfa' },
    { label: 'Total Pets',     value: stats?.totalPets     ?? pets.length,               icon: 'paw-outline',       color: '#f59e0b' },
    { label: 'Personality',    value: stats?.totalPersonalityTests ?? personalityResults.length, icon: 'bulb-outline', color: '#f87171' },
    { label: 'Store Items',    value: storeItems.length,                                 icon: 'bag-outline',       color: '#60a5fa' },
    { label: 'Orders',         value: orders.length,                                     icon: 'cart-outline',      color: '#34d399' },
  ];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={[styles.badge, { backgroundColor: '#a78bfa30' }]}>
            <Text style={[styles.badgeText, { color: '#a78bfa' }]}>ADMIN</Text>
          </View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <Ionicons name="shield-checkmark" size={26} color="rgba(255,255,255,0.5)" />
      </LinearGradient>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map(({ key, label, icon }) => {
          const active = tab === key;
          const badge = key === 'orders' && orders.length > 0 ? orders.length : null;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tabBtn, active && { borderBottomColor: Colors.primary, borderBottomWidth: 2 }]}
            >
              <Ionicons name={icon} size={14} color={active ? Colors.primary : theme.colors.textTertiary} />
              <Text style={[styles.tabBtnText, { color: active ? Colors.primary : theme.colors.textTertiary, fontWeight: active ? '700' : '400' }]}>
                {label}
              </Text>
              {badge ? (
                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{badge}</Text></View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.base, paddingBottom: 40 }}
        >
          <ErrBanner msg={error} theme={theme} />

          {/* ══ OVERVIEW ══ */}
          {tab === 'overview' && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Platform Stats</Text>
              <View style={styles.statsGrid}>
                {STAT_CARDS.map(s => (
                  <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} theme={theme} />
                ))}
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: Spacing.xl }]}>Recent Articles</Text>
              {[...articles].reverse().slice(0, 5).map(a => (
                <View key={a._id || a.id} style={[styles.previewRow, { borderLeftColor: Colors.primary }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.previewTitle, { color: theme.colors.textPrimary }]}>{a.title}</Text>
                    {a.category ? <Text style={[styles.previewSub, { color: theme.colors.textTertiary }]}>{a.category}</Text> : null}
                  </View>
                  {a.createdAt ? (
                    <Text style={[styles.previewDate, { color: theme.colors.textTertiary }]}>{formatDate(a.createdAt, 'short')}</Text>
                  ) : null}
                </View>
              ))}
              {articles.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No articles yet.</Text>}
            </View>
          )}

          {/* ══ ORDERS ══ */}
          {tab === 'orders' && (
            <View>
              {orders.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No orders yet.</Text>}
              {orders.map(order => {
                const oid = order._id || order.id;
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                return (
                  <Card key={oid} style={{ marginBottom: Spacing.sm }} shadow="sm">
                    <View style={styles.orderHeader}>
                      <Text style={[styles.orderNum, { color: Colors.primary }]}>#{oid?.slice(-6).toUpperCase()}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: sc.color }]}>{order.status}</Text>
                      </View>
                      <Text style={[styles.orderTotal, { color: theme.colors.textPrimary }]}>{order.totalAmount} EGP</Text>
                    </View>
                    {order.createdAt ? <Text style={[styles.orderDate, { color: theme.colors.textTertiary }]}>{formatDate(order.createdAt, 'datetime')}</Text> : null}
                    {order.customer ? (
                      <View style={{ gap: 3, marginBottom: 8 }}>
                        <Text style={[styles.listSub, { color: theme.colors.textSecondary }]}>👤 {order.customer.fullName}   📧 {order.customer.email}</Text>
                        <Text style={[styles.listSub, { color: theme.colors.textSecondary }]}>📞 {order.customer.phone}   📍 {order.customer.governorate}</Text>
                        {order.customer.address ? <Text style={[styles.listSub, { color: theme.colors.textSecondary }]}>🏠 {order.customer.address}</Text> : null}
                      </View>
                    ) : null}
                    {order.items?.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {order.items.map((item, idx) => (
                          <View key={idx} style={[styles.orderItem, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
                            <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>
                              {item.itemType === 'pet' ? '🐾' : '📦'} {item.name} — {item.price} EGP
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={styles.statusBtns}>
                      {['pending', 'confirmed', 'cancelled', 'delivered'].map(s => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => updateOrderStatus(oid, s)}
                          disabled={order.status === s}
                          style={[styles.statusBtn, { backgroundColor: order.status === s ? Colors.primary : theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
                        >
                          <Text style={[styles.statusBtnText, { color: order.status === s ? '#fff' : theme.colors.textSecondary }]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {/* ══ ARTICLES ══ */}
          {tab === 'articles' && (
            <View>
              <Card shadow="sm" style={{ marginBottom: Spacing.base }}>
                <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>➕ Add Article</Text>
                <SectionLabel theme={theme}>Title *</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="Article title…" placeholderTextColor={theme.colors.textTertiary}
                  value={artTitle} onChangeText={setArtTitle} />
                <SectionLabel theme={theme}>Content</SectionLabel>
                <TextInput style={[styles.input, styles.textarea, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="Article content…" placeholderTextColor={theme.colors.textTertiary}
                  multiline numberOfLines={4} value={artContent} onChangeText={setArtContent} />
                <SectionLabel theme={theme}>Category</SectionLabel>
                <SelectInput value={artCat} options={ART_CATEGORIES} onChange={setArtCat} theme={theme} />
                <TouchableOpacity style={[styles.btnPrimary, !artTitle.trim() && styles.btnDisabled]} onPress={addArticle} disabled={!artTitle.trim()}>
                  <Text style={styles.btnPrimaryText}>Publish Article</Text>
                </TouchableOpacity>
              </Card>

              {[...articles].reverse().map(a => {
                const id = a._id || a.id;
                const isEditing = editArt?.id === id;
                return (
                  <Card key={id} shadow="sm" style={{ marginBottom: Spacing.sm }}>
                    {isEditing ? (
                      <View>
                        <Text style={[styles.editingLabel, { color: Colors.primary }]}>✏️ Editing</Text>
                        <SectionLabel theme={theme}>Title</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          value={editArt.title} onChangeText={v => setEditArt(p => ({ ...p, title: v }))} />
                        <SectionLabel theme={theme}>Content</SectionLabel>
                        <TextInput style={[styles.input, styles.textarea, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          multiline numberOfLines={3} value={editArt.content} onChangeText={v => setEditArt(p => ({ ...p, content: v }))} />
                        <SectionLabel theme={theme}>Category</SectionLabel>
                        <SelectInput value={editArt.category} options={ART_CATEGORIES} onChange={v => setEditArt(p => ({ ...p, category: v }))} theme={theme} />
                        <View style={styles.inlineActions}>
                          <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={saveArticle}>
                            <Text style={styles.btnPrimaryText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnGhost, { flex: 1, borderColor: theme.colors.border }]} onPress={() => setEditArt(null)}>
                            <Text style={[styles.btnGhostText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.listRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>{a.title}</Text>
                          {a.category ? <View style={[styles.chip, { backgroundColor: '#4ecdc420', alignSelf: 'flex-start', marginVertical: 3 }]}><Text style={{ color: '#4ecdc4', fontSize: 10, fontWeight: '700' }}>{a.category}</Text></View> : null}
                          {a.content ? <Text style={[styles.listSub, { color: theme.colors.textSecondary }]} numberOfLines={2}>{a.content}</Text> : null}
                          {a.createdAt ? <Text style={[styles.listDate, { color: theme.colors.textTertiary }]}>{formatDate(a.createdAt, 'short')}</Text> : null}
                        </View>
                        <View style={styles.rowBtns}>
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: theme.colors.surfaceAlt }]}
                            onPress={() => setEditArt({ id, title: a.title, content: a.content || '', category: a.category || 'Mental Health' })}>
                            <Ionicons name="pencil-outline" size={14} color={theme.colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: Colors.error + '20' }]} onPress={() => deleteArticle(id)}>
                            <Ionicons name="trash-outline" size={14} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Card>
                );
              })}
              {articles.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No articles yet.</Text>}
            </View>
          )}

          {/* ══ PETS ══ */}
          {tab === 'pets' && (
            <View>
              <Card shadow="sm" style={{ marginBottom: Spacing.base }}>
                <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>➕ Add Pet</Text>
                <SectionLabel theme={theme}>Name *</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="Pet name…" placeholderTextColor={theme.colors.textTertiary}
                  value={petForm.name} onChangeText={v => setPetForm(f => ({ ...f, name: v }))} />
                <SectionLabel theme={theme}>Type</SectionLabel>
                <SelectInput value={petForm.type} options={PET_TYPES} onChange={v => setPetForm(f => ({ ...f, type: v }))} theme={theme} />
                <SectionLabel theme={theme}>Personality</SectionLabel>
                <SelectInput value={petForm.personality || '— select —'} options={['— select —', ...PET_PERS]}
                  onChange={v => setPetForm(f => ({ ...f, personality: v === '— select —' ? '' : v }))} theme={theme} />
                <SectionLabel theme={theme}>Description</SectionLabel>
                <TextInput style={[styles.input, styles.textarea, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="Description…" placeholderTextColor={theme.colors.textTertiary} multiline numberOfLines={3}
                  value={petForm.description} onChangeText={v => setPetForm(f => ({ ...f, description: v }))} />
                <SectionLabel theme={theme}>Price (EGP)</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric"
                  value={petForm.price} onChangeText={v => setPetForm(f => ({ ...f, price: v }))} />
                <SectionLabel theme={theme}>Contact</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="+20 100 000 0000" placeholderTextColor={theme.colors.textTertiary}
                  value={petForm.contact} onChangeText={v => setPetForm(f => ({ ...f, contact: v }))} />
                <SectionLabel theme={theme}>Image URL</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="https://…" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="none"
                  value={petForm.image} onChangeText={v => setPetForm(f => ({ ...f, image: v }))} />
                <SectionLabel theme={theme}>Status</SectionLabel>
                <SelectInput value={petForm.status} options={['available', 'sold']} onChange={v => setPetForm(f => ({ ...f, status: v }))} theme={theme} />
                <TouchableOpacity style={[styles.btnPrimary, !petForm.name.trim() && styles.btnDisabled]} onPress={addPet} disabled={!petForm.name.trim()}>
                  <Text style={styles.btnPrimaryText}>Add Pet</Text>
                </TouchableOpacity>
              </Card>

              {[...pets].reverse().map(p => {
                const id = p._id || p.id;
                const isEditing = editPet && (editPet._id || editPet.id) === id;
                return (
                  <Card key={id} shadow="sm" style={{ marginBottom: Spacing.sm }}>
                    {isEditing ? (
                      <View>
                        <Text style={[styles.editingLabel, { color: Colors.primary }]}>✏️ Editing: {p.name}</Text>
                        <SectionLabel theme={theme}>Name</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          value={editPet.name} onChangeText={v => setEditPet(s => ({ ...s, name: v }))} />
                        <SectionLabel theme={theme}>Type</SectionLabel>
                        <SelectInput value={editPet.type} options={PET_TYPES} onChange={v => setEditPet(s => ({ ...s, type: v }))} theme={theme} />
                        <SectionLabel theme={theme}>Personality</SectionLabel>
                        <SelectInput value={editPet.personality || '— select —'} options={['— select —', ...PET_PERS]}
                          onChange={v => setEditPet(s => ({ ...s, personality: v === '— select —' ? '' : v }))} theme={theme} />
                        <SectionLabel theme={theme}>Description</SectionLabel>
                        <TextInput style={[styles.input, styles.textarea, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          multiline numberOfLines={2} value={editPet.description}
                          onChangeText={v => setEditPet(s => ({ ...s, description: v }))} />
                        <SectionLabel theme={theme}>Image URL</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          placeholder="https://…" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="none"
                          value={editPet.image || ''} onChangeText={v => setEditPet(s => ({ ...s, image: v }))} />
                        <SectionLabel theme={theme}>Price (EGP)</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          keyboardType="numeric" value={String(editPet.price || 0)}
                          onChangeText={v => setEditPet(s => ({ ...s, price: v }))} />
                        <SectionLabel theme={theme}>Contact</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          placeholder="+20 100 000 0000" placeholderTextColor={theme.colors.textTertiary}
                          value={editPet.contact || ''} onChangeText={v => setEditPet(s => ({ ...s, contact: v }))} />
                        <SectionLabel theme={theme}>Status</SectionLabel>
                        <SelectInput value={editPet.status || 'available'} options={['available', 'sold']}
                          onChange={v => setEditPet(s => ({ ...s, status: v }))} theme={theme} />
                        <View style={styles.inlineActions}>
                          <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={savePet}>
                            <Text style={styles.btnPrimaryText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnGhost, { flex: 1, borderColor: theme.colors.border }]} onPress={() => setEditPet(null)}>
                            <Text style={[styles.btnGhostText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.listRow}>
                        {p.image ? (
                          <Image source={{ uri: p.image }} style={styles.thumbImg} />
                        ) : (
                          <View style={[styles.thumbImg, { backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 22 }}>🐾</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>{p.name}</Text>
                          <Text style={[styles.listSub, { color: theme.colors.textSecondary }]}>{[p.type, p.personality].filter(Boolean).join(' · ')}</Text>
                          {p.description ? <Text style={[styles.listSub, { color: theme.colors.textTertiary }]} numberOfLines={2}>{p.description}</Text> : null}
                          {p.price ? <Text style={[styles.priceText, { color: Colors.primary }]}>{p.price} EGP</Text> : null}
                        </View>
                        <View style={styles.rowBtns}>
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: theme.colors.surfaceAlt }]} onPress={() => setEditPet({ ...p })}>
                            <Ionicons name="pencil-outline" size={14} color={theme.colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: Colors.error + '20' }]} onPress={() => deletePet(id)}>
                            <Ionicons name="trash-outline" size={14} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Card>
                );
              })}
              {pets.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No pets yet.</Text>}
            </View>
          )}

          {/* ══ STORE ══ */}
          {tab === 'store' && (
            <View>
              <Card shadow="sm" style={{ marginBottom: Spacing.base }}>
                <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>➕ Add Store Item</Text>
                <SectionLabel theme={theme}>Title *</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="Item title…" placeholderTextColor={theme.colors.textTertiary}
                  value={storeForm.title} onChangeText={v => setStoreForm(f => ({ ...f, title: v }))} />
                <SectionLabel theme={theme}>Description</SectionLabel>
                <TextInput style={[styles.input, styles.textarea, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="Description…" placeholderTextColor={theme.colors.textTertiary} multiline numberOfLines={3}
                  value={storeForm.description} onChangeText={v => setStoreForm(f => ({ ...f, description: v }))} />
                <SectionLabel theme={theme}>Price (EGP) *</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric"
                  value={storeForm.price} onChangeText={v => setStoreForm(f => ({ ...f, price: v }))} />
                <SectionLabel theme={theme}>Category</SectionLabel>
                <SelectInput value={storeForm.category} options={STORE_CATS} onChange={v => setStoreForm(f => ({ ...f, category: v }))} theme={theme} />
                <SectionLabel theme={theme}>Condition</SectionLabel>
                <SelectInput value={storeForm.condition} options={STORE_CONDS} onChange={v => setStoreForm(f => ({ ...f, condition: v }))} theme={theme} />
                <SectionLabel theme={theme}>Contact</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="email or phone" placeholderTextColor={theme.colors.textTertiary}
                  value={storeForm.contact} onChangeText={v => setStoreForm(f => ({ ...f, contact: v }))} />
                <SectionLabel theme={theme}>Image URL</SectionLabel>
                <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                  placeholder="https://…" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="none"
                  value={storeForm.image} onChangeText={v => setStoreForm(f => ({ ...f, image: v }))} />
                <TouchableOpacity
                  style={[styles.btnPrimary, (!storeForm.title.trim() || !storeForm.price) && styles.btnDisabled]}
                  onPress={addStoreItem} disabled={!storeForm.title.trim() || !storeForm.price}
                >
                  <Text style={styles.btnPrimaryText}>Add Item</Text>
                </TouchableOpacity>
              </Card>

              {storeItems.map(item => {
                const id = item._id || item.id;
                const isEditing = editStore && (editStore._id || editStore.id) === id;
                const condColor = COND_COLORS[item.condition] || '#94a3b8';
                return (
                  <Card key={id} shadow="sm" style={[{ marginBottom: Spacing.sm }, item.status === 'sold' && { opacity: 0.65 }]}>
                    {isEditing ? (
                      <View>
                        <Text style={[styles.editingLabel, { color: Colors.primary }]}>✏️ Editing: {item.title}</Text>
                        <SectionLabel theme={theme}>Title</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          value={editStore.title} onChangeText={v => setEditStore(s => ({ ...s, title: v }))} />
                        <SectionLabel theme={theme}>Description</SectionLabel>
                        <TextInput style={[styles.input, styles.textarea, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          multiline numberOfLines={2} value={editStore.description}
                          onChangeText={v => setEditStore(s => ({ ...s, description: v }))} />
                        <SectionLabel theme={theme}>Price (EGP)</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          keyboardType="numeric" value={String(editStore.price || '')}
                          onChangeText={v => setEditStore(s => ({ ...s, price: v }))} />
                        <SectionLabel theme={theme}>Category</SectionLabel>
                        <SelectInput value={editStore.category} options={STORE_CATS} onChange={v => setEditStore(s => ({ ...s, category: v }))} theme={theme} />
                        <SectionLabel theme={theme}>Condition</SectionLabel>
                        <SelectInput value={editStore.condition} options={STORE_CONDS} onChange={v => setEditStore(s => ({ ...s, condition: v }))} theme={theme} />
                        <SectionLabel theme={theme}>Contact</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          value={editStore.contact} onChangeText={v => setEditStore(s => ({ ...s, contact: v }))} />
                        <SectionLabel theme={theme}>Image URL</SectionLabel>
                        <TextInput style={[styles.input, { backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary }]}
                          placeholder="https://…" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="none"
                          value={editStore.image || ''} onChangeText={v => setEditStore(s => ({ ...s, image: v }))} />
                        <View style={styles.inlineActions}>
                          <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={saveStoreItem}>
                            <Text style={styles.btnPrimaryText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnGhost, { flex: 1, borderColor: theme.colors.border }]} onPress={() => setEditStore(null)}>
                            <Text style={[styles.btnGhostText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <View style={styles.listRow}>
                          {item.image ? <Image source={{ uri: item.image }} style={styles.thumbImg} /> : null}
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                              <View style={[styles.chip, { backgroundColor: condColor + '22' }]}>
                                <Text style={{ color: condColor, fontSize: 10, fontWeight: '700' }}>{item.condition}</Text>
                              </View>
                              <View style={[styles.chip, { backgroundColor: '#4ecdc420' }]}>
                                <Text style={{ color: '#4ecdc4', fontSize: 10, fontWeight: '700' }}>{item.category}</Text>
                              </View>
                              {item.status === 'sold' ? (
                                <View style={[styles.chip, { backgroundColor: Colors.error + '22' }]}>
                                  <Text style={{ color: Colors.error, fontSize: 10, fontWeight: '700' }}>SOLD</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={[styles.priceText, { color: Colors.primary }]}>{item.price} EGP</Text>
                          </View>
                          <View style={styles.rowBtns}>
                            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: theme.colors.surfaceAlt }]} onPress={() => setEditStore({ ...item })}>
                              <Ionicons name="pencil-outline" size={14} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: Colors.error + '20' }]} onPress={() => deleteStoreItem(id)}>
                              <Ionicons name="trash-outline" size={14} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                          {item.status === 'available' ? (
                            <TouchableOpacity style={[styles.chip, { backgroundColor: '#22c55e20', paddingVertical: 6 }]} onPress={() => markStoreSold(id)}>
                              <Text style={{ color: '#16a34a', fontSize: 11, fontWeight: '700' }}>✓ Mark Sold</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity style={[styles.chip, { backgroundColor: '#60a5fa20', paddingVertical: 6 }]} onPress={() => markStoreAvailable(id)}>
                              <Text style={{ color: '#3b82f6', fontSize: 11, fontWeight: '700' }}>♻ Restock</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </Card>
                );
              })}
              {storeItems.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No store items yet.</Text>}
            </View>
          )}

          {/* ══ USERS ══ */}
          {tab === 'users' && (
            <View>
              <Text style={[styles.meta, { color: theme.colors.textTertiary, marginBottom: Spacing.sm }]}>
                {users.length} user{users.length !== 1 ? 's' : ''}
              </Text>
              {users.map(u => {
                const id = u._id || u.id;
                return (
                  <Card key={id} shadow="sm" style={{ marginBottom: Spacing.sm }}>
                    <View style={styles.listRow}>
                      <Avatar name={u.name || u.email} uri={u.avatar} size={44} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>{u.name || '—'}</Text>
                        <Text style={[styles.listSub, { color: theme.colors.textTertiary }]}>{u.email}</Text>
                        {u.createdAt ? <Text style={[styles.listDate, { color: theme.colors.textTertiary }]}>Joined {formatDate(u.createdAt, 'short')}</Text> : null}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={[styles.chip, { backgroundColor: u.role === 'admin' ? '#a78bfa20' : '#4ecdc420' }]}>
                          <Text style={{ color: u.role === 'admin' ? '#a78bfa' : '#4ecdc4', fontSize: 10, fontWeight: '700' }}>{u.role}</Text>
                        </View>
                        {u.role !== 'admin' ? (
                          <TouchableOpacity style={[styles.smallBtn, { backgroundColor: Colors.error + '20' }]} onPress={() => deleteUser(id, u.name || u.email)}>
                            <Ionicons name="trash-outline" size={14} color={Colors.error} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  </Card>
                );
              })}
              {users.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No users found.</Text>}
            </View>
          )}

          {/* ══ PERSONALITY ══ */}
          {tab === 'personality' && (
            <View>
              <Text style={[styles.meta, { color: theme.colors.textTertiary, marginBottom: Spacing.sm }]}>
                {personalityResults.length} result{personalityResults.length !== 1 ? 's' : ''}
              </Text>
              {personalityResults.map((r, idx) => (
                <Card key={r._id || idx} shadow="sm" style={{ marginBottom: Spacing.sm }}>
                  <View style={styles.listRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>
                        {r.userId?.name || r.userId?.email || r.userId || 'Unknown user'}
                      </Text>
                      <Text style={[styles.listSub, { color: theme.colors.textSecondary }]}>
                        Result: <Text style={{ fontWeight: '700' }}>{r.result}</Text>
                        {r.createdAt ? `  ·  ${formatDate(r.createdAt, 'short')}` : ''}
                      </Text>
                    </View>
                    <View style={[styles.chip, { backgroundColor: '#4ecdc420' }]}>
                      <Text style={{ color: '#4ecdc4', fontSize: 11, fontWeight: '700' }}>{r.result}</Text>
                    </View>
                  </View>
                </Card>
              ))}
              {personalityResults.length === 0 && <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>No personality results yet.</Text>}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg, gap: Spacing.md },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginBottom: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  tabBar: { borderBottomWidth: 1 },
  tabBarContent: { paddingHorizontal: Spacing.sm, gap: 2 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  tabBtnText: { fontSize: 13 },
  tabBadge: { backgroundColor: Colors.error, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 2 },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  errBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: Spacing.base },
  errText: { fontSize: 13, flex: 1 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: Spacing.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { width: '30%', flex: 1, minWidth: 90, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, gap: 4 },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center' },

  previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 12, borderLeftWidth: 3, marginBottom: 6 },
  previewTitle: { fontSize: 14, fontWeight: '600' },
  previewSub: { fontSize: 11, marginTop: 2 },
  previewDate: { fontSize: 11, marginLeft: Spacing.sm },

  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  orderNum: { fontSize: 14, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  orderTotal: { marginLeft: 'auto', fontSize: 15, fontWeight: '800' },
  orderDate: { fontSize: 11, marginBottom: 8 },
  orderItem: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusBtnText: { fontSize: 11, fontWeight: '600' },

  formTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.sm },
  input: { borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 6 },
  textarea: { height: 80, textAlignVertical: 'top' },
  btnPrimary: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.sm },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.45 },
  btnGhost: { paddingVertical: 10, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1 },
  btnGhostText: { fontWeight: '600', fontSize: 13 },
  inlineActions: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm },
  editingLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },

  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  listTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  listSub: { fontSize: 12, lineHeight: 18 },
  listDate: { fontSize: 11, marginTop: 2 },
  priceText: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  rowBtns: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  smallBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  thumbImg: { width: 54, height: 54, borderRadius: 10, flexShrink: 0 },

  empty: { textAlign: 'center', paddingVertical: 30, fontSize: 14 },
  meta: { fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: Spacing.md, maxHeight: 400 },
  pickerHandle: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  pickerOpt: { paddingHorizontal: Spacing.base, paddingVertical: 14, borderRadius: 8, marginHorizontal: Spacing.sm },
});

export default AdminScreen;
