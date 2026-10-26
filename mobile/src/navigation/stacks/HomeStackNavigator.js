import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import ArticlesScreen from '../../screens/articles/ArticlesScreen';
import ArticleDetailScreen from '../../screens/articles/ArticleDetailScreen';
import JournalScreen from '../../screens/journal/JournalScreen';
import JournalEntryScreen from '../../screens/journal/JournalEntryScreen';
import GoalsScreen from '../../screens/goals/GoalsScreen';
import PetStoreScreen from '../../screens/pets/PetStoreScreen';
import BreatheScreen from '../../screens/breathe/BreatheScreen';
import PersonalityTestScreen from '../../screens/personality/PersonalityTestScreen';
import PersonalityResultScreen from '../../screens/personality/PersonalityResultScreen';
import StoreScreen from '../../screens/store/StoreScreen';
import CreateListingScreen from '../../screens/store/CreateListingScreen';
import CartScreen from '../../screens/store/CartScreen';
import CheckoutScreen from '../../screens/store/CheckoutScreen';
import MyOrdersScreen from '../../screens/orders/MyOrdersScreen';
import AdminScreen from '../../screens/admin/AdminScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Articles" component={ArticlesScreen} />
    <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
    <Stack.Screen name="JournalEntry" component={JournalEntryScreen} />
    <Stack.Screen name="Goals" component={GoalsScreen} />
    <Stack.Screen name="PetStore" component={PetStoreScreen} />
    <Stack.Screen name="Breathe" component={BreatheScreen} />
    <Stack.Screen name="PersonalityTest" component={PersonalityTestScreen} />
    <Stack.Screen name="PersonalityResult" component={PersonalityResultScreen} />
    <Stack.Screen name="Store" component={StoreScreen} />
    <Stack.Screen name="CreateListing" component={CreateListingScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
    <Stack.Screen name="Admin" component={AdminScreen} />
  </Stack.Navigator>
);

export default HomeStackNavigator;
