import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoodTrackerScreen from '../../screens/mood/MoodTrackerScreen';
import MoodHistoryScreen from '../../screens/mood/MoodHistoryScreen';

const Stack = createStackNavigator();

const MoodStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
    <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} />
  </Stack.Navigator>
);

export default MoodStackNavigator;
