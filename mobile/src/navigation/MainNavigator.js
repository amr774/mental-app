import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors, Typography } from '../theme';

import HomeStackNavigator from './stacks/HomeStackNavigator';
import ChatStackNavigator from './stacks/ChatStackNavigator';
import MoodStackNavigator from './stacks/MoodStackNavigator';
import CommunityStackNavigator from './stacks/CommunityStackNavigator';
import ProfileStackNavigator from './stacks/ProfileStackNavigator';
import EmotionStackNavigator from './stacks/EmotionStackNavigator';

const Tab = createBottomTabNavigator();

// Color palettes per tab — matches Quick Actions style
const TAB_COLORS = {
  home:      ['#6366f1', '#8b5cf6'],
  chat:      ['#4ecdc4', '#2cb5b5'],
  mood:      ['#f87171', '#ef4444'],
  community: ['#60a5fa', '#2563eb'],
  emotion:   ['#a78bfa', '#7c3aed'],
  profile:   ['#34d399', '#059669'],
};

const TabBarIcon = ({ focused, name, label, gradientColors }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.tabItem}>
      {focused ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBg}
        >
          <Ionicons name={name} size={22} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.iconBg, styles.iconBgInactive, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name={name} size={22} color={theme.colors.textTertiary} />
        </View>
      )}
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? gradientColors[0] : theme.colors.textTertiary },
          focused && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const MainNavigator = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 8 },
          }),
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? 'home' : 'home-outline'}
              label={t('home')}
              gradientColors={TAB_COLORS.home}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              label={t('chat')}
              gradientColors={TAB_COLORS.chat}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MoodTab"
        component={MoodStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? 'heart' : 'heart-outline'}
              label={t('mood')}
              gradientColors={TAB_COLORS.mood}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? 'people' : 'people-outline'}
              label={t('community')}
              gradientColors={TAB_COLORS.community}
            />
          ),
        }}
      />
      <Tab.Screen
        name="EmotionTab"
        component={EmotionStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? 'scan' : 'scan-outline'}
              label="Scan"
              gradientColors={TAB_COLORS.emotion}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? 'person' : 'person-outline'}
              label={t('profile')}
              gradientColors={TAB_COLORS.profile}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    minWidth: 52,
    gap: 4,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBgInactive: {
    shadowOpacity: 0,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

export default MainNavigator;
