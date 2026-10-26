export const Colors = {
  // Primary — teal (matches web --teal)
  primary: '#4ecdc4',
  primaryDark: '#3ab5ac',
  primaryLight: '#7dddd7',

  // Secondary — lavender (matches web --lavender)
  secondary: '#9b8ec4',
  secondaryDark: '#7b6ea8',
  secondaryLight: '#b8aedd',

  // Accent — sage green (matches web --sage)
  accent: '#a8c5bc',
  accentDark: '#7aa89d',
  accentLight: '#c5ddd7',

  // Mood colors
  moodGreat: '#4ecdc4',
  moodGood: '#9b8ec4',
  moodOkay: '#f0c070',
  moodBad: '#e8a598',
  moodTerrible: '#fc8181',

  // Neutrals — dark mode (matches web dark theme)
  white: '#FFFFFF',
  black: '#000000',
  background: '#f4f6f9',
  surface: '#ffffff',
  surfaceAlt: '#eef1f6',
  border: 'rgba(0,0,0,0.08)',
  divider: '#e4e8f0',

  // Text (light mode)
  textPrimary: '#0d0f14',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textInverse: '#FFFFFF',
  textLink: '#4ecdc4',

  // Status
  success: '#4ecdc4',
  successLight: 'rgba(78,205,196,0.15)',
  warning: '#f0c070',
  warningLight: 'rgba(240,192,112,0.15)',
  error: '#fc8181',
  errorLight: 'rgba(252,129,129,0.15)',
  info: '#9b8ec4',
  infoLight: 'rgba(155,142,196,0.15)',

  // Amber
  amber: '#f0c070',
  rose: '#e8a598',

  // Dark mode palette (matches web dark theme)
  dark: {
    background: '#0d0f14',
    surface: '#141720',
    surfaceAlt: '#1c2030',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#eef0f5',
    textSecondary: '#8890a8',
    textTertiary: '#545c74',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 8,
  },
  teal: {
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
};

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
