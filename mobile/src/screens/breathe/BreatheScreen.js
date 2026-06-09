import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors, Typography, Spacing } from '../../theme';

const EXERCISES = [
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'Inhale 4s, hold 7s, exhale 8s — calms the nervous system',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    color: Colors.primary,
    color2: Colors.secondary,
    benefit: 'Reduces anxiety & aids sleep',
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s — improves focus',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
    color: Colors.accent,
    color2: Colors.accentDark,
    benefit: 'Improves focus & reduces stress',
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: 'Inhale 5s, exhale 5s — simple & effective',
    inhale: 5,
    hold: 0,
    exhale: 5,
    cycles: 8,
    color: Colors.secondary,
    color2: Colors.secondaryDark,
    benefit: 'Instant calming effect',
  },
];

const BreatheScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('inhale'); // 'inhale' | 'hold' | 'exhale' | 'hold2'
  const [countdown, setCountdown] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [done, setDone] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const timerRef = useRef(null);

  const stopExercise = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase('inhale');
    setCountdown(0);
    setCyclesCompleted(0);
    setDone(false);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.6);
  }, [scaleAnim, opacityAnim]);

  const animateForPhase = useCallback((p, duration) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: p === 'inhale' ? 1.5 : p === 'exhale' ? 1 : 1.5,
        duration: duration * 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: p === 'inhale' ? 1 : p === 'exhale' ? 0.6 : 1,
        duration: duration * 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const startExercise = () => {
    setDone(false);
    setIsRunning(true);
    setCyclesCompleted(0);
    setPhase('inhale');
    setCountdown(selectedExercise.inhale);
    animateForPhase('inhale', selectedExercise.inhale);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let currentPhase = 'inhale';
    let currentCount = selectedExercise.inhale;
    let cycles = 0;
    const ex = selectedExercise;

    timerRef.current = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);

      if (currentCount <= 0) {
        // Transition
        if (currentPhase === 'inhale') {
          if (ex.hold > 0) {
            currentPhase = 'hold';
            currentCount = ex.hold;
            setPhase('hold');
            animateForPhase('hold', ex.hold);
          } else {
            currentPhase = 'exhale';
            currentCount = ex.exhale;
            setPhase('exhale');
            animateForPhase('exhale', ex.exhale);
          }
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          currentCount = ex.exhale;
          setPhase('exhale');
          animateForPhase('exhale', ex.exhale);
        } else if (currentPhase === 'exhale') {
          cycles += 1;
          setCyclesCompleted(cycles);
          if (cycles >= ex.cycles) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setDone(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return;
          }
          currentPhase = 'inhale';
          currentCount = ex.inhale;
          setPhase('inhale');
          animateForPhase('inhale', ex.inhale);
        }
        setCountdown(currentCount);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const phaseLabel = { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', hold2: 'Hold' };
  const phaseColor = {
    inhale: selectedExercise.color,
    hold: Colors.warning,
    exhale: selectedExercise.color2,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Breathing Exercise" onBack={() => { stopExercise(); navigation.goBack(); }} />

      <View style={styles.content}>
        {/* Exercise Selector */}
        {!isRunning && !done && (
          <View style={styles.exerciseSelector}>
            {EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.exerciseCard,
                  { backgroundColor: theme.colors.surface, borderColor: selectedExercise.id === ex.id ? ex.color : theme.colors.border },
                  selectedExercise.id === ex.id && { borderWidth: 2.5 },
                ]}
                onPress={() => setSelectedExercise(ex)}
              >
                <LinearGradient colors={[ex.color, ex.color2]} style={styles.exerciseColorDot} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exerciseName, { color: theme.colors.textPrimary }]}>{ex.name}</Text>
                  <Text style={[styles.exerciseBenefit, { color: ex.color }]}>{ex.benefit}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Breathing Circle */}
        {(isRunning || done) && (
          <View style={styles.circleContainer}>
            <Text style={[styles.phaseLabelText, { color: phaseColor[phase] || Colors.primary }]}>
              {done ? '🎉 Complete!' : phaseLabel[phase]}
            </Text>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <LinearGradient
                colors={[selectedExercise.color, selectedExercise.color2]}
                style={styles.circleGradient}
              >
                {!done && (
                  <>
                    <Text style={styles.countdownText}>{countdown}</Text>
                    <Text style={styles.secondsLabel}>seconds</Text>
                  </>
                )}
                {done && <Ionicons name="checkmark" size={64} color={Colors.white} />}
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.cyclesText, { color: theme.colors.textSecondary }]}>
              Cycle {cyclesCompleted + (isRunning ? 1 : 0)}/{selectedExercise.cycles}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!isRunning && !done && (
            <TouchableOpacity style={styles.startBtn} onPress={startExercise}>
              <LinearGradient
                colors={[selectedExercise.color, selectedExercise.color2]}
                style={styles.startBtnGradient}
              >
                <Ionicons name="play" size={32} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}
          {isRunning && (
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.colors.surfaceAlt }]} onPress={stopExercise}>
              <Ionicons name="stop" size={32} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          {done && (
            <TouchableOpacity style={styles.startBtn} onPress={startExercise}>
              <LinearGradient colors={[selectedExercise.color, selectedExercise.color2]} style={styles.startBtnGradient}>
                <Ionicons name="refresh" size={32} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {!isRunning && !done && (
          <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
            {selectedExercise.description}
          </Text>
        )}
        {done && (
          <Text style={[styles.doneMsg, { color: theme.colors.textPrimary }]}>
            Great work! You completed {selectedExercise.cycles} cycles of {selectedExercise.name}. 🌟
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, padding: Spacing.base, alignItems: 'center' },
  exerciseSelector: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.xl },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseColorDot: { width: 12, height: 40, borderRadius: 6 },
  exerciseName: { fontSize: Typography.fontSize.base, fontWeight: '700', marginBottom: 2 },
  exerciseBenefit: { fontSize: Typography.fontSize.xs },
  circleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
  phaseLabelText: { fontSize: Typography.fontSize.xl, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  circleGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: { fontSize: 64, fontWeight: '200', color: Colors.white },
  secondsLabel: { fontSize: Typography.fontSize.base, color: 'rgba(255,255,255,0.8)' },
  cyclesText: { fontSize: Typography.fontSize.base },
  controls: { marginVertical: Spacing.xl },
  startBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnGradient: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: { fontSize: Typography.fontSize.base, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.xl },
  doneMsg: { fontSize: Typography.fontSize.base, textAlign: 'center', lineHeight: 24, fontWeight: '600' },
});

export default BreatheScreen;
