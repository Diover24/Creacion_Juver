import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegisterScreen from '../Screens/Auth/RegisterScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';
import HomeScreen from '../Screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Crear Cuenta' }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Inicio', headerLeft: null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;