import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { emotionService, moodService } from '../../api/services';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

// ─── Emotion metadata ─────────────────────────────────────────────────────────
const EMOTIONS = {
  happy:    { emoji: '😊', label: 'Happy',    color: '#f59e0b', gradient: ['#fde68a', '#f59e0b'], bg: '#fffbeb', tip: 'Your happiness is shining! Share this energy with someone you care about.' },
  sad:      { emoji: '😢', label: 'Sad',      color: '#3b82f6', gradient: ['#bfdbfe', '#3b82f6'], bg: '#eff6ff', tip: "It's okay to feel sad. Try journaling your thoughts or taking a slow walk." },
  angry:    { emoji: '😠', label: 'Angry',    color: '#ef4444', gradient: ['#fecaca', '#ef4444'], bg: '#fef2f2', tip: 'Take 5 deep breaths. Physical exercise is also great for releasing tension.' },
  fear:     { emoji: '😨', label: 'Fear',     color: '#8b5cf6', gradient: ['#ede9fe', '#8b5cf6'], bg: '#f5f3ff', tip: "You're safe. Try the breathing exercise — it helps calm the nervous system." },
  surprise: { emoji: '😲', label: 'Surprise', color: '#f97316', gradient: ['#fed7aa', '#f97316'], bg: '#fff7ed', tip: 'Take a moment to ground yourself. Notice 5 things you can see around you.' },
  disgust:  { emoji: '🤢', label: 'Disgust',  color: '#22c55e', gradient: ['#bbf7d0', '#22c55e'], bg: '#f0fdf4', tip: 'Step back from whatever is bothering you and try a short mindfulness break.' },
  neutral:  { emoji: '😐', label: 'Neutral',  color: '#94a3b8', gradient: ['#e2e8f0', '#94a3b8'], bg: '#f8fafc', tip: "A calm moment. Great time to log your mood or set a small goal for today." },
  no_face:  { emoji: '🤷', label: 'No Face',  color: '#94a3b8', gradient: ['#e2e8f0', '#94a3b8'], bg: '#f8fafc', tip: 'No face was detected. Try taking a clearer photo with good lighting.' },
};

const EMOTION_TO_MOOD = {
  happy: 5, surprise: 4, neutral: 3, fear: 2, sad: 2, disgust: 1, angry: 1,
};

const getEmotion = (key) => EMOTIONS[key] || EMOTIONS.neutral;

// ─── Sub-components ───────────────────────────────────────────────────────────
const ScoreBar = ({ emotion, score, isTop, theme }) => {
  const meta = getEmotion(emotion);
  const pct = Math.round(score * 100);
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreEmoji}>{meta.emoji}</Text>
      <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>{meta.label}</Text>
      <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: isTop ? meta.color : theme.colors.border }]} />
      </View>
      <Text style={[styles.scorePct, { color: isTop ? meta.color : theme.colors.textTertiary, fontWeight: isTop ? '700' : '400' }]}>
        {pct}%
      </Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const FaceEmotionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = useCallback(async (fromCamera) => {
    setError(null);
    setResult(null);

    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission needed', fromCamera ? 'Camera access is required.' : 'Photo library access is required.');
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, base64: false });

    if (pickerResult.canceled) return;

    const uri = pickerResult.assets[0].uri;
    setImageUri(uri);
    await analyzeImage(uri);
  }, []);

  const analyzeImage = useCallback(async (uri) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const res = await emotionService.predict(b64);
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Analysis failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogMood = useCallback(async () => {
    if (!result || result.emotion === 'no_face') return;
    const value = EMOTION_TO_MOOD[result.emotion] || 3;
    try {
      await moodService.logMood({ value, note: `Emotion scan: ${result.emotion} (${Math.round(result.confidence * 100)}% confidence)` });
      Alert.alert('Logged!', `${getEmotion(result.emotion).emoji} "${getEmotion(result.emotion).label}" has been added to your mood history.`);
    } catch {
      Alert.alert('Error', 'Could not save mood. Please try again.');
    }
  }, [result]);

  const meta = result ? getEmotion(result.emotion) : null;
  const sortedScores = result?.scores
    ? Object.entries(result.scores).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEmoji}>🧠</Text>
            <Text style={styles.headerTitle}>Face Emotion Scan</Text>
            <Text style={styles.headerSub}>AI-powered emotion recognition</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* Image preview + scan buttons */}
          <Card style={styles.cameraCard}>
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                {loading && (
                  <View style={styles.scanOverlay}>
                    <LoadingSpinner />
                    <Text style={styles.scanningText}>Analyzing face...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 64 }}>🤳</Text>
                <Text style={[styles.placeholderTitle, { color: theme.colors.textPrimary }]}>
                  Take or upload a photo
                </Text>
                <Text style={[styles.placeholderSub, { color: theme.colors.textSecondary }]}>
                  Your face will be analyzed by the AI model
                </Text>
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#6366f1' }]}
                onPress={() => pickImage(true)}
                disabled={loading}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                onPress={() => pickImage(false)}
                disabled={loading}
              >
                <Ionicons name="images" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Error */}
          {error && (
            <Card style={[styles.errorCard, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="warning-outline" size={20} color={Colors.error} />
              <Text style={[styles.errorText, { color: Colors.error }]}>{error}</Text>
            </Card>
          )}

          {/* Results */}
          {result && meta && !loading && (
            <>
              {/* Main emotion card */}
              <LinearGradient colors={meta.gradient} style={styles.resultCard}>
                <Text style={styles.resultEmoji}>{meta.emoji}</Text>
                <Text style={styles.resultEmotion}>{meta.label}</Text>
                <Text style={styles.resultConfidence}>
                  {Math.round(result.confidence * 100)}% confidence
                </Text>
                {!result.face_detected && (
                  <View style={styles.noFaceBadge}>
                    <Text style={styles.noFaceText}>⚠️ No face detected — used full image</Text>
                  </View>
                )}
              </LinearGradient>

              {/* Tip */}
              <Card style={[styles.tipCard, { backgroundColor: meta.bg }]}>
                <Ionicons name="bulb-outline" size={18} color={meta.color} />
                <Text style={[styles.tipText, { color: meta.color }]}>{meta.tip}</Text>
              </Card>

              {/* All scores */}
              <Card>
                <Text style={[styles.scoresTitle, { color: theme.colors.textPrimary }]}>
                  Emotion Breakdown
                </Text>
                {sortedScores.map(([emotion, score], i) => (
                  <ScoreBar
                    key={emotion}
                    emotion={emotion}
                    score={score}
                    isTop={i === 0}
                    theme={theme}
                  />
                ))}
              </Card>

              {/* Actions */}
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.logBtn, { backgroundColor: meta.color }]}
                  onPress={handleLogMood}
                  disabled={result.emotion === 'no_face'}
                >
                  <Ionicons name="heart" size={18} color="#fff" />
                  <Text style={styles.logBtnText}>Log This Mood</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.breatheBtn, { borderColor: theme.colors.border }]}
                  onPress={() => navigation.navigate('HomeTab', { screen: 'Breathe' })}
                >
                  <Ionicons name="flower-outline" size={18} color={Colors.primary} />
                  <Text style={[styles.breatheBtnText, { color: Colors.primary }]}>Breathe</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Intro cards when no result yet */}
          {!result && !loading && (
            <>
              <Card style={styles.infoCard}>
                <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>How it works</Text>
                {[
                  { icon: 'camera-outline', text: 'Take or upload a selfie' },
                  { icon: 'scan-outline',   text: 'AI detects your face using OpenCV' },
                  { icon: 'brain-outline',  text: 'MobileNetV3 classifies your emotion' },
                  { icon: 'heart-outline',  text: 'Log it to your mood tracker' },
                ].map(({ icon, text }) => (
                  <View key={text} style={styles.infoRow}>
                    <Ionicons name={icon} size={20} color={Colors.primary} />
                    <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{text}</Text>
                  </View>
                ))}
              </Card>

              <Card style={styles.emotionsGrid}>
                <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>7 Emotions Detected</Text>
                <View style={styles.emotionChips}>
                  {Object.entries(EMOTIONS).filter(([k]) => k !== 'no_face').map(([key, val]) => (
                    <View key={key} style={[styles.emotionChip, { backgroundColor: val.bg, borderColor: val.color + '40' }]}>
                      <Text style={{ fontSize: 20 }}>{val.emoji}</Text>
                      <Text style={[styles.chipLabel, { color: val.color }]}>{val.label}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, paddingTop: Spacing.lg, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { position: 'absolute', top: Spacing.lg, left: Spacing.base, padding: 6 },
  headerCenter: { alignItems: 'center', paddingTop: 8 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: Typography.fontSize['2xl'], fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { padding: Spacing.base },
  cameraCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.base },
  placeholder: { height: 220, alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderTitle: { fontSize: Typography.fontSize.base, fontWeight: '700' },
  placeholderSub: { fontSize: Typography.fontSize.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
  previewContainer: { position: 'relative' },
  preview: { width: '100%', height: 260 },
  scanOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  scanningText: { color: '#fff', fontSize: Typography.fontSize.base, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BorderRadius.md },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: Typography.fontSize.sm },
  errorCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: Spacing.base },
  errorText: { flex: 1, fontSize: Typography.fontSize.sm },
  resultCard: { borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.base, gap: 4 },
  resultEmoji: { fontSize: 72, marginBottom: 8 },
  resultEmotion: { fontSize: Typography.fontSize['3xl'], fontWeight: '800', color: '#fff' },
  resultConfidence: { fontSize: Typography.fontSize.base, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  noFaceBadge: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: BorderRadius.full, paddingVertical: 4, paddingHorizontal: 12 },
  noFaceText: { color: '#fff', fontSize: Typography.fontSize.xs, fontWeight: '600' },
  tipCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: Spacing.base },
  tipText: { flex: 1, fontSize: Typography.fontSize.sm, lineHeight: 20, fontWeight: '500' },
  scoresTitle: { fontSize: Typography.fontSize.base, fontWeight: '700', marginBottom: Spacing.md },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  scoreEmoji: { fontSize: 18, width: 26 },
  scoreLabel: { width: 62, fontSize: Typography.fontSize.xs },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  scorePct: { width: 36, fontSize: Typography.fontSize.xs, textAlign: 'right' },
  resultActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  logBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: BorderRadius.md },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: Typography.fontSize.base },
  breatheBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: BorderRadius.md, borderWidth: 1.5 },
  breatheBtnText: { fontWeight: '700', fontSize: Typography.fontSize.sm },
  infoCard: { marginBottom: Spacing.base },
  infoTitle: { fontSize: Typography.fontSize.base, fontWeight: '700', marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoText: { flex: 1, fontSize: Typography.fontSize.sm },
  emotionsGrid: { marginBottom: Spacing.base },
  emotionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  emotionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: BorderRadius.full, borderWidth: 1 },
  chipLabel: { fontSize: Typography.fontSize.xs, fontWeight: '700' },
});

export default FaceEmotionScreen;
