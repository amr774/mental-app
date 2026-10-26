import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../api/services';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { formatPrice, getErrorMessage } from '../../utils/helpers';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الغربية', 'الدقهلية',
  'الشرقية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'مطروح',
  'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'المنيا', 'بني سويف',
  'الفيوم', 'الوادي الجديد', 'البحر الأحمر',
];

const DELIVERY_FEE = 70;

const CheckoutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email:    user?.email || '',
    phone:    '',
    governorate: '',
    address:  '',
  });
  const [payment, setPayment]       = useState('cash');
  const [visa, setVisa]             = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [govOpen, setGovOpen]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [orderNum, setOrderNum]     = useState('');

  const grandTotal = total + DELIVERY_FEE;

  const setField  = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setVField = (k, v) => {
    if (k === 'number') v = v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (k === 'expiry') v = v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
    if (k === 'cvv')    v = v.replace(/\D/g, '').slice(0, 3);
    setVisa((f) => ({ ...f, [k]: v }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName    = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    if (!form.phone.trim())       e.phone       = 'Required';
    if (!form.governorate)        e.governorate = 'Required';
    if (!form.address.trim())     e.address     = 'Required';
    if (payment === 'visa') {
      if (visa.number.replace(/\s/g, '').length < 16) e.visaNumber = 'Invalid card';
      if (visa.expiry.length < 5)  e.visaExpiry = 'Invalid';
      if (visa.cvv.length < 3)     e.visaCvv    = 'Invalid';
      if (!visa.name.trim())       e.visaName   = 'Required';
    }
    return e;
  };

  const handleSubmit = async () => {
    if (!items.length) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await orderService.create({
        items: items.map((i) => ({
          itemId:   i.id,
          itemType: i.itemType,
          name:     i.name,
          price:    i.price,
          image:    i.image || '',
        })),
        customer:      form,
        paymentMethod: payment,
        deliveryFee:   DELIVERY_FEE,
        totalAmount:   grandTotal,
      });
      const order = res.data || res;
      setOrderNum(order._id?.slice(-6).toUpperCase() || '------');
      clearCart();
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success ── */
  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Order Confirmed" />
        <View style={styles.successWrap}>
          <Text style={{ fontSize: 64 }}>🎉</Text>
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Order placed!</Text>
          <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
            Thank you for your order. We'll contact you soon to confirm delivery.
          </Text>
          <View style={[styles.orderNumBox, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.orderNumLabel, { color: theme.colors.textSecondary }]}>Order Number</Text>
            <Text style={[styles.orderNumVal, { color: Colors.primary }]}>#{orderNum}</Text>
          </View>
          <View style={{ width: '100%', marginTop: Spacing.xl, gap: Spacing.sm }}>
            <Button title="View My Orders" onPress={() => navigation.navigate('MyOrders')} />
            <Button title="Back Home" variant="outline" onPress={() => navigation.navigate('Dashboard')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Empty ── */
  if (!items.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <Text style={{ fontSize: 56 }}>🛒</Text>
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Your cart is empty</Text>
          <View style={{ width: '100%', marginTop: Spacing.lg }}>
            <Button title="Browse Store" onPress={() => navigation.navigate('Store')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ── Order summary ── */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>🧾 Order Summary</Text>
          {items.map((item) => (
            <View key={`${item.itemType}-${item.id}`} style={styles.sumItem}>
              <Text style={{ fontSize: 22 }}>{item.itemType === 'pet' ? '🐾' : '📦'}</Text>
              <Text style={[styles.sumName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.sumPrice, { color: Colors.primary }]}>{formatPrice(item.price)}</Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.totalVal, { color: theme.colors.textPrimary }]}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>🚚 Delivery</Text>
            <Text style={[styles.totalVal, { color: theme.colors.textPrimary }]}>{formatPrice(DELIVERY_FEE)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.finalLabel, { color: theme.colors.textPrimary }]}>Total</Text>
            <Text style={[styles.finalVal, { color: Colors.primary }]}>{formatPrice(grandTotal)}</Text>
          </View>
        </Card>

        {/* ── Customer info ── */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>📋 Delivery Info</Text>
          <Input label="Full Name *" value={form.fullName} onChangeText={(v) => setField('fullName', v)} placeholder="Your name" autoCapitalize="words" error={errors.fullName} />
          <Input label="Email *" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="example@email.com" keyboardType="email-address" error={errors.email} />
          <Input label="Phone *" value={form.phone} onChangeText={(v) => setField('phone', v)} placeholder="01X XXXX XXXX" keyboardType="phone-pad" error={errors.phone} />

          {/* Governorate picker */}
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Governorate *</Text>
          <TouchableOpacity
            style={[styles.govBtn, { backgroundColor: theme.colors.surface, borderColor: errors.governorate ? Colors.error : theme.colors.border }]}
            onPress={() => setGovOpen(true)}
          >
            <Text style={{ color: form.governorate ? theme.colors.textPrimary : theme.colors.textTertiary, fontSize: Typography.fontSize.base }}>
              {form.governorate || '— Select governorate —'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
          {errors.governorate ? <Text style={styles.errText}>{errors.governorate}</Text> : null}

          <View style={{ height: Spacing.base }} />
          <Input label="Address *" value={form.address} onChangeText={(v) => setField('address', v)} placeholder="Street, building, apartment…" multiline numberOfLines={3} error={errors.address} />
        </Card>

        {/* ── Payment ── */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>💳 Payment Method</Text>
          {[
            { key: 'cash', icon: '💵', title: 'Cash on Delivery', sub: 'Pay when your order arrives' },
            { key: 'visa', icon: '💳', title: 'Visa / Card', sub: 'Test mode — no real charge' },
          ].map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.payOption, {
                borderColor: payment === p.key ? Colors.primary : theme.colors.border,
                backgroundColor: payment === p.key ? Colors.primary + '12' : 'transparent',
              }]}
              onPress={() => setPayment(p.key)}
            >
              <Text style={{ fontSize: 24 }}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.payTitle, { color: theme.colors.textPrimary }]}>{p.title}</Text>
                <Text style={[styles.paySub, { color: theme.colors.textTertiary }]}>{p.sub}</Text>
              </View>
              <Ionicons
                name={payment === p.key ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={payment === p.key ? Colors.primary : theme.colors.textTertiary}
              />
            </TouchableOpacity>
          ))}

          {payment === 'visa' && (
            <View style={styles.visaForm}>
              <View style={[styles.testBanner, { backgroundColor: Colors.warningLight }]}>
                <Text style={[styles.testText, { color: Colors.warning }]}>🔒 Test mode — do not use a real card</Text>
              </View>
              <Input label="Card Number" value={visa.number} onChangeText={(v) => setVField('number', v)} placeholder="1234 5678 9012 3456" keyboardType="number-pad" error={errors.visaNumber} />
              <Input label="Cardholder Name" value={visa.name} onChangeText={(v) => setVField('name', v)} placeholder="Name on card" autoCapitalize="words" error={errors.visaName} />
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Input label="Expiry" value={visa.expiry} onChangeText={(v) => setVField('expiry', v)} placeholder="MM/YY" keyboardType="number-pad" error={errors.visaExpiry} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="CVV" value={visa.cvv} onChangeText={(v) => setVField('cvv', v)} placeholder="123" keyboardType="number-pad" secureTextEntry error={errors.visaCvv} />
                </View>
              </View>
            </View>
          )}
        </Card>

        {errors.submit ? (
          <View style={[styles.submitErr, { backgroundColor: Colors.errorLight }]}>
            <Text style={{ color: Colors.error, fontSize: Typography.fontSize.sm }}>{errors.submit}</Text>
          </View>
        ) : null}

        <Button
          title={`✅ Place Order — ${formatPrice(grandTotal)}`}
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>

      {/* Governorate modal */}
      <Modal visible={govOpen} transparent animationType="slide" onRequestClose={() => setGovOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setGovOpen(false)}>
          <View style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Governorate</Text>
            <FlatList
              data={GOVERNORATES}
              keyExtractor={(g) => g}
              renderItem={({ item: g }) => (
                <TouchableOpacity
                  style={[styles.govRow, { borderBottomColor: theme.colors.border }]}
                  onPress={() => { setField('governorate', g); setGovOpen(false); }}
                >
                  <Text style={{ color: theme.colors.textPrimary, fontSize: Typography.fontSize.base }}>{g}</Text>
                  {form.governorate === g && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll:      { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing['3xl'] },
  card:        { gap: Spacing.sm },
  sectionTitle:{ fontSize: Typography.fontSize.md, fontWeight: '800', marginBottom: Spacing.xs },
  sumItem:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 4 },
  sumName:     { flex: 1, fontSize: Typography.fontSize.sm, fontWeight: '600' },
  sumPrice:    { fontSize: Typography.fontSize.sm, fontWeight: '700' },
  divider:     { height: 1, marginVertical: Spacing.sm },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  totalLabel:  { fontSize: Typography.fontSize.sm },
  totalVal:    { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  finalLabel:  { fontSize: Typography.fontSize.md, fontWeight: '800', marginTop: 4 },
  finalVal:    { fontSize: Typography.fontSize.lg, fontWeight: '800', marginTop: 4 },
  inputLabel:  { fontSize: Typography.fontSize.sm, fontWeight: '500', marginBottom: Spacing.xs, marginLeft: 2 },
  govBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, minHeight: 52 },
  errText:     { fontSize: Typography.fontSize.xs, color: Colors.error, marginTop: 4, marginLeft: 4 },
  payOption:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1.5, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  payTitle:    { fontSize: Typography.fontSize.sm, fontWeight: '700' },
  paySub:      { fontSize: Typography.fontSize.xs, marginTop: 2 },
  visaForm:    { marginTop: Spacing.xs },
  testBanner:  { padding: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.md },
  testText:    { fontSize: Typography.fontSize.xs, fontWeight: '700', textAlign: 'center' },
  submitErr:   { padding: Spacing.md, borderRadius: BorderRadius.md },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successTitle:{ fontSize: Typography.fontSize['2xl'], fontWeight: '800', marginTop: Spacing.base },
  successSub:  { fontSize: Typography.fontSize.base, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  orderNumBox: { alignItems: 'center', paddingVertical: Spacing.base, paddingHorizontal: Spacing['2xl'], borderRadius: BorderRadius.lg, marginTop: Spacing.xl },
  orderNumLabel:{ fontSize: Typography.fontSize.xs, fontWeight: '600' },
  orderNumVal: { fontSize: Typography.fontSize['2xl'], fontWeight: '800', marginTop: 4 },
  modalBackdrop:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:  { maxHeight: '70%', borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.base },
  modalTitle:  { fontSize: Typography.fontSize.lg, fontWeight: '800', marginBottom: Spacing.md, textAlign: 'center' },
  govRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1 },
});

export default CheckoutScreen;
