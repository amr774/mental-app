export const Colors = {
  // Brand palette — calm mental-health blues/purples
  primary: '#6B9FD4',
  primaryDark: '#4A7DB5',
  primaryLight: '#8FBDE0',
  secondary: '#9B89D0',
  secondaryDark: '#7B67B5',
  secondaryLight: '#B9ACDE',
  accent: '#7CC4A4',
  accentDark: '#5CA882',
  accentLight: '#A3D9C0',

  // Mood colors
  moodGreat: '#7CC4A4',
  moodGood: '#6B9FD4',
  moodOkay: '#F4D06F',
  moodBad: '#F4A460',
  moodTerrible: '#FC8181',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F4F6F9',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  border: '#DDE3ED',
  divider: '#EAEEf4',

  // Text
  textPrimary: '#2D3748',
  textSecondary: '#718096',
  textTertiary: '#A0AEC0',
  textInverse: '#FFFFFF',
  textLink: '#6B9FD4',

  // Status
  success: '#48BB78',
  successLight: '#C6F6D5',
  warning: '#ED8936',
  warningLight: '#FEEBC8',
  error: '#FC8181',
  errorLight: '#FED7D7',
  info: '#63B3ED',
  infoLight: '#BEE3F8',

  // Dark mode
  dark: {
    background: '#1A202C',
    surface: '#2D3748',
    surfaceAlt: '#3D4A5E',
    border: '#4A5568',
    textPrimary: '#F7FAFC',
    textSecondary: '#CBD5E0',
    textTertiary: '#718096',
  },
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 38,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Reusable card style
export const CardStyle = {
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.lg,
  padding: Spacing.base,
  ...Shadows.md,
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  CardStyle,
};
