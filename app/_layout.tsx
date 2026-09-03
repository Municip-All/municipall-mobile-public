import '../lib/map/pinImages';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Slot, Redirect, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@context/themecontext';
import { AuthProvider } from '@context/authcontext';
import PushNotificationRegistrar from '@components/PushNotificationRegistrar';
import BrandingSync from '@components/BrandingSync';
import { CityProvider } from '@context/citycontext';
import { DEFAULT_PRIMARY, palette } from '@constants/design';
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
      <SafeAreaProvider>
        <ThemeProvider>
          <LoadingScreen />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CityProvider>
          <AuthProvider>
            <BrandingSync />
            <PushNotificationRegistrar />
            {needsOnboarding && pathname !== '/onboarding' ? <Redirect href='/onboarding' /> : null}
            <Slot />
          </AuthProvider>
        </CityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function LoadingScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  return (
    <View
      style={[styles.loadingRoot, { backgroundColor: dark ? palette.nightBg : palette.cream100 }]}>
      <ActivityIndicator size='large' color={dark ? palette.cream50 : DEFAULT_PRIMARY} />
      <Text style={[styles.loadingText, { color: dark ? palette.nightMuted : palette.muted }]}>
        Chargement...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
