import React, { useEffect, useState } from 'react';
import { Stack, Redirect, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '@context/themecontext';
import { AuthProvider } from '@context/authcontext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import '../global.css';

import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await AsyncStorage.getItem('onboarding_completed_v1');
        if (!mounted) return;
        setNeedsOnboarding(v !== 'true');
      } catch {
        if (!mounted) return;
        setNeedsOnboarding(true);
      } finally {
        if (!mounted) return;
        setOnboardingChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (!fontsLoaded || !onboardingChecked) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        {needsOnboarding && pathname !== '/onboarding' ? <Redirect href='/onboarding' /> : null}
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_right',
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
