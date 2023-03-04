import React, {useState, useEffect} from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../routes/home/index';
import ChatScreen from '../routes/messages';

const Stack = createStackNavigator();

const HomeNavigator = (userDetails) => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
        initialParams={userDetails}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ headerShown: false }}
        initialParams={userDetails}
      />
    </Stack.Navigator>
  );
}

export default HomeNavigator