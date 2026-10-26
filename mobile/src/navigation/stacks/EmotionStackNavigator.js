import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FaceEmotionScreen from '../../screens/emotion/FaceEmotionScreen';

const Stack = createStackNavigator();

const EmotionStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FaceEmotion" component={FaceEmotionScreen} />
  </Stack.Navigator>
);

export default EmotionStackNavigator;
