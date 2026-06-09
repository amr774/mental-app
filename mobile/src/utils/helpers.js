import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing
export const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
export const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isTablet = SCREEN_WIDTH >= 768;

// Date formatting
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (format === 'datetime') {
    return `${formatDate(date, 'short')} • ${formatDate(date, 'time')}`;
  }
  return d.toLocaleDateString();
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date, 'short');
};

// Greeting based on time of day
export const getGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('goodMorning');
  if (hour < 17) return t('goodAfternoon');
  return t('goodEvening');
};

// Mood helpers
export const MOOD_OPTIONS = [
  { value: 5, label: 'great', emoji: '😄', color: '#7CC4A4' },
  { value: 4, label: 'good', emoji: '🙂', color: '#6B9FD4' },
  { value: 3, label: 'okay', emoji: '😐', color: '#F4D06F' },
  { value: 2, label: 'bad', emoji: '😔', color: '#F4A460' },
  { value: 1, label: 'terrible', emoji: '😢', color: '#FC8181' },
];

export const getMoodByValue = (value) =>
  MOOD_OPTIONS.find((m) => m.value === value) || MOOD_OPTIONS[2];

export const getMoodColor = (value) => getMoodByValue(value).color;
export const getMoodEmoji = (value) => getMoodByValue(value).emoji;

// Text truncation
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Capitalize
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format price
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price || 0);

// Error message extractor from axios errors
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};

// Avatar URL builder
export const getAvatarUrl = (avatar, baseUrl) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${baseUrl || process.env.EXPO_PUBLIC_API_URL}/${avatar}`;
};

// Validation helpers
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPassword = (password) => password && password.length >= 6;

// Platform helpers
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Array chunking for grids
export const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};
