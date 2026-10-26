import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatSelectScreen from '../../screens/chat/ChatSelectScreen';
import ChatScreen       from '../../screens/chat/ChatScreen';
import WithUBotScreen   from '../../screens/chat/WithUBotScreen';

const Stack = createStackNavigator();

const ChatStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatSelect" component={ChatSelectScreen} />
    <Stack.Screen name="MindfulChat" component={ChatScreen} />
    <Stack.Screen name="WithUBot"    component={WithUBotScreen} />
  </Stack.Navigator>
);

export default ChatStackNavigator;
