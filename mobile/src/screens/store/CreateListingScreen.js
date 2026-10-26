import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { storeService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const CATEGORIES = ['Books', 'Wellness', 'Art', 'Electronics', 'Clothing', 'Other'];

const CreateListingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) e.price = 'Valid price required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', parseFloat(price));
      if (category) formData.append('category', category);
      await storeService.create(formData);
      Alert.alert('Listed!', 'Your item has been listed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (_) {
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title={t('createListing')} onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Image placeholder */}
          <TouchableOpacity style={[styles.imagePicker, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="camera-outline" size={36} color={theme.colors.textTertiary} />
            <Text style={[styles.imagePickerText, { color: theme.colors.textTertiary }]}>
              Add Photo (optional)
            </Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary, borderColor: errors.title ? Colors.error : theme.colors.border, backgroundColor: theme.colors.surface }]}
              placeholder="What are you selling?"
              placeholderTextColor={theme.colors.textTertiary}
              value={title}
              onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: null })); }}
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline, { color: theme.colors.textPrimary, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              placeholder="Describe your item..."
              placeholderTextColor={theme.colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Price */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Price ($) *</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary, borderColor: errors.price ? Colors.error : theme.colors.border, backgroundColor: theme.colors.surface }]}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textTertiary}
              value={price}
              onChangeText={(v) => { setPrice(v); setErrors((e) => ({ ...e, price: null })); }}
              keyboardType="decimal-pad"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
            <View style={styles.categories}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat === category ? '' : cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat ? Colors.primary : theme.colors.surfaceAlt,
                      borderColor: category === cat ? Colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: category === cat ? Colors.white : theme.colors.textSecondary }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={loading ? 'Creating...' : t('createListing')}
            onPress={handleCreate}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  imagePicker: {
    height: 160,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  imagePickerText: { fontSize: Typography.fontSize.base },
  field: { gap: 6 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 52,
  },
  multiline: { minHeight: 100, paddingTop: Spacing.md },
  errorText: { fontSize: Typography.fontSize.xs, color: Colors.error },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  categoryText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
});

export default CreateListingScreen;
