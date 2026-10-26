import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatPrice } from '../../utils/helpers';

const DELIVERY_FEE = 70;

const CartScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { items, removeItem, total } = useCart();

  const grandTotal = total + (items.length ? DELIVERY_FEE : 0);

  if (!items.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="My Cart" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>🛒</Text>}
          title="Your cart is empty"
          subtitle="Browse the store or pet shop to add items"
          actionLabel="Browse Store"
          onAction={() => navigation.navigate('Store')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title={`My Cart (${items.length})`} onBack={() => navigation.goBack()} />

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.itemType}-${item.id}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.itemCard} shadow="sm">
            {item.image
              ? <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />
              : (
                <View style={[styles.itemImg, styles.itemImgPh, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={{ fontSize: 26 }}>{item.itemType === 'pet' ? '🐾' : '📦'}</Text>
                </View>
              )
            }
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={[styles.typeBadge, { backgroundColor: Colors.primary + '22' }]}>
                <Text style={[styles.typeText, { color: Colors.primary }]}>
                  {item.itemType === 'pet' ? 'Pet' : 'Store'}
                </Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.itemPrice, { color: Colors.primary }]}>{formatPrice(item.price)}</Text>
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: Colors.error + '18' }]}
                onPress={() => removeItem(item.id, item.itemType)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListFooterComponent={
          <Card style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.totalVal, { color: theme.colors.textPrimary }]}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>🚚 Delivery</Text>
              <Text style={[styles.totalVal, { color: theme.colors.textPrimary }]}>{formatPrice(DELIVERY_FEE)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalFinal, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.finalLabel, { color: theme.colors.textPrimary }]}>Total</Text>
              <Text style={[styles.finalVal, { color: Colors.primary }]}>{formatPrice(grandTotal)}</Text>
            </View>
          </Card>
        }
      />

      <View style={[styles.checkoutBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <Button
          title={`Checkout — ${formatPrice(grandTotal)}`}
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list:        { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.lg },
  itemCard:    { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, gap: Spacing.md },
  itemImg:     { width: 56, height: 56, borderRadius: BorderRadius.md },
  itemImgPh:   { alignItems: 'center', justifyContent: 'center' },
  itemInfo:    { flex: 1, gap: 4 },
  itemName:    { fontSize: Typography.fontSize.sm, fontWeight: '700', lineHeight: 18 },
  typeBadge:   { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  typeText:    { fontSize: 10, fontWeight: '700' },
  itemRight:   { alignItems: 'flex-end', gap: 8 },
  itemPrice:   { fontSize: Typography.fontSize.base, fontWeight: '800' },
  removeBtn:   { width: 32, height: 32, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  totals:      { marginTop: Spacing.sm, gap: Spacing.sm },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel:  { fontSize: Typography.fontSize.sm },
  totalVal:    { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  totalFinal:  { borderTopWidth: 1, paddingTop: Spacing.sm, marginTop: 2 },
  finalLabel:  { fontSize: Typography.fontSize.md, fontWeight: '800' },
  finalVal:    { fontSize: Typography.fontSize.lg, fontWeight: '800' },
  checkoutBar: { padding: Spacing.base, borderTopWidth: 1 },
});

export default CartScreen;
