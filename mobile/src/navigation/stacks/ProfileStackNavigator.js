import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import MyOrdersScreen from '../../screens/orders/MyOrdersScreen';

const Stack = createStackNavigator();

const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
  </Stack.Navigator>
);

export default ProfileStackNavigator;
