import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authService } from '../services/database';

import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../Screens/Onboarding/OnboardingScreen';

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    const subscriber = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return subscriber;
  }, []);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding:', error);
      setHasSeenOnboarding(true);
    }
  };

  if (initializing || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!hasSeenOnboarding ? (
        <OnboardingScreen onFinish={handleFinishOnboarding} />
      ) : user ? (
        <TabNavigator />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;