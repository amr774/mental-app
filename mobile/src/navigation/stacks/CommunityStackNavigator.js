import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CommunityScreen from '../../screens/community/CommunityScreen';
import PostDetailScreen from '../../screens/community/PostDetailScreen';
import CreatePostScreen from '../../screens/community/CreatePostScreen';

const Stack = createStackNavigator();

const CommunityStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Community" component={CommunityScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
  </Stack.Navigator>
);

export default CommunityStackNavigator;
