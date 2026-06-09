import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from '../../screens/chat/ChatScreen';

const Stack = createStackNavigator();

const ChatStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

export default ChatStackNavigator;
