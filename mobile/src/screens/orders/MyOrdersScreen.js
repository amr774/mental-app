import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatPrice, formatDate } from '../../utils/helpers';

const STATUS_META = {
  pending:   { icon: '🕐', color: '#d97706', bg: 'rgba(251,191,36,0.14)',  label: 'Pending'   },
  confirmed: { icon: '✅', color: '#0d9488', bg: 'rgba(78,205,196,0.14)',  label: 'Confirmed' },
  delivered: { icon: '📦', color: '#16a34a', bg: 'rgba(74,222,128,0.14)',  label: 'Delivered' },
  cancelled: { icon: '❌', color: '#dc2626', bg: 'rgba(248,113,113,0.14)', label: 'Cancelled' },
};

const STEPS = ['pending', 'confirmed', 'delivered'];

const StatusBar = ({ status, theme }) => {
  if (status === 'cancelled') {
    return (
      <View style={[styles.cancelledBar, { backgroundColor: STATUS_META.cancelled.bg }]}>
        <Text style={{ color: STATUS_META.cancelled.color, fontWeight: '700', fontSize: Typography.fontSize.sm }}>
          ❌ Order cancelled
        </Text>
      </View>
    );
  }
  const idx = STEPS.indexOf(status);
  return (
    <View style={styles.steps}>
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <React.Fragment key={s}>
            <View style={styles.step}>
              <View style={[styles.stepCircle, { backgroundColor: done ? Colors.primary : theme.colors.surfaceAlt }]}>
                <Text style={{ color: done ? '#fff' : theme.colors.textTertiary, fontSize: 11, fontWeight: '800' }}>
                  {done ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, { color: done ? Colors.primary : theme.colors.textTertiary }]}>
                {STATUS_META[s].label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: i < idx ? Colors.primary : theme.colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const MyOrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded]   = useState({});

  const load = useCallback(async () => {
    try {
      const res = await orderService.getMyOrders();
      const data = res.data || res;
      setOrders(Array.isArray(data) ? data : []);
    } catch (_) {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="My Orders" onBack={() => navigation.goBack()} />
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="My Orders" onBack={() => navigation.goBack()} />

      <FlatList
        data={orders}
        keyExtractor={(o) => o._id || o.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Text style={{ fontSize: 48 }}>🛒</Text>}
            title="No orders yet"
            subtitle="When you place an order, it will show up here"
            actionLabel="Browse Store"
            onAction={() => navigation.navigate('HomeTab', { screen: 'Store' })}
          />
        }
        renderItem={({ item: order }) => {
          const oid  = order._id || order.id;
          const meta = STATUS_META[order.status] || STATUS_META.pending;
          const open = expanded[oid];
          const subtotal = (order.totalAmount || 0) - (order.deliveryFee || 0);

          return (
            <Card style={styles.orderCard}>
              <TouchableOpacity style={styles.cardTop} onPress={() => toggle(oid)} activeOpacity={0.7}>
                <View>
                  <Text style={[styles.orderId, { color: theme.colors.textPrimary }]}>#{oid?.slice(-6).toUpperCase()}</Text>
                  <Text style={[styles.orderDate, { color: theme.colors.textTertiary }]}>
                    {order.createdAt ? formatDate(order.createdAt, 'long') : ''}
                  </Text>
                </View>
                <View style={styles.cardTopRight}>
                  <Text style={[styles.orderTotal, { color: Colors.primary }]}>{formatPrice(order.totalAmount)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={{ color: meta.color, fontSize: 11, fontWeight: '700' }}>{meta.icon} {meta.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={{ marginTop: Spacing.md }}>
                <StatusBar status={order.status} theme={theme} />
              </View>

              {open && (
                <View style={[styles.details, { borderTopColor: theme.colors.border }]}>
                  {/* Items */}
                  <Text style={[styles.detailTitle, { color: theme.colors.textSecondary }]}>📦 Items</Text>
                  {order.items?.map((item, i) => (
                    <View key={i} style={styles.detailItem}>
                      <Text style={{ fontSize: 18 }}>{item.itemType === 'pet' ? '🐾' : '📦'}</Text>
                      <Text style={[styles.detailItemName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.detailItemPrice, { color: Colors.primary }]}>{formatPrice(item.price)}</Text>
                    </View>
                  ))}

                  {/* Totals */}
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Subtotal</Text>
                    <Text style={[styles.totalVal, { color: theme.colors.textPrimary }]}>{formatPrice(subtotal)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>🚚 Delivery</Text>
                    <Text style={[styles.totalVal, { color: theme.colors.textPrimary }]}>{formatPrice(order.deliveryFee)}</Text>
                  </View>

                  {/* Delivery info */}
                  <Text style={[styles.detailTitle, { color: theme.colors.textSecondary, marginTop: Spacing.md }]}>📍 Delivery To</Text>
                  <View style={{ gap: 4 }}>
                    <Text style={[styles.deliveryLine, { color: theme.colors.textSecondary }]}>👤 {order.customer?.fullName}</Text>
                    <Text style={[styles.deliveryLine, { color: theme.colors.textSecondary }]}>📞 {order.customer?.phone}</Text>
                    <Text style={[styles.deliveryLine, { color: theme.colors.textSecondary }]}>🗺️ {order.customer?.governorate} — {order.customer?.address}</Text>
                    <Text style={[styles.deliveryLine, { color: theme.colors.textSecondary }]}>
                      💳 {order.paymentMethod === 'visa' ? 'Visa / Card' : 'Cash on Delivery'}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.expandHint} onPress={() => toggle(oid)}>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list:        { padding: Spacing.base, gap: Spacing.sm, flexGrow: 1 },
  orderCard:   { gap: 0 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId:     { fontSize: Typography.fontSize.md, fontWeight: '800' },
  orderDate:   { fontSize: Typography.fontSize.xs, marginTop: 2 },
  cardTopRight:{ alignItems: 'flex-end', gap: 6 },
  orderTotal:  { fontSize: Typography.fontSize.base, fontWeight: '800' },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  steps:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step:        { alignItems: 'center', gap: 4 },
  stepCircle:  { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepLabel:   { fontSize: 10, fontWeight: '700' },
  stepLine:    { flex: 1, height: 2, marginHorizontal: 4, marginBottom: 14 },
  cancelledBar:{ padding: Spacing.sm, borderRadius: BorderRadius.sm, alignItems: 'center' },
  details:     { borderTopWidth: 1, marginTop: Spacing.md, paddingTop: Spacing.md, gap: Spacing.xs },
  detailTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', marginBottom: Spacing.xs },
  detailItem:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 3 },
  detailItemName: { flex: 1, fontSize: Typography.fontSize.sm, fontWeight: '600' },
  detailItemPrice:{ fontSize: Typography.fontSize.sm, fontWeight: '700' },
  divider:     { height: 1, marginVertical: Spacing.sm },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalLabel:  { fontSize: Typography.fontSize.sm },
  totalVal:    { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  deliveryLine:{ fontSize: Typography.fontSize.sm, lineHeight: 20 },
  expandHint:  { alignItems: 'center', marginTop: Spacing.sm },
});

export default MyOrdersScreen;
