import React from 'react';
import { View, Pressable, Text, Platform, Dimensions, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BottomBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const dark = colorScheme === 'dark';

  const primaryColor = config?.theme.primaryColor || '#0B0080';
  const tabHeight = 64;
  const totalHeight = tabHeight + insets.bottom;

  // Icons and labels based on the user's provided image
  const tabs = [
    { id: 'home', label: 'Accueil', icon: 'home', path: '/home' },
    { id: 'events', label: 'Évènement', icon: 'calendar', path: '/events' },
    { id: 'center', label: 'Signaler', icon: 'paper-plane', path: '/carte', isCenter: true },
    { id: 'contact', label: 'Contact', icon: 'chatbubble', path: '/contact' },
    { id: 'profile', label: 'Profile', icon: 'person', path: '/profile' },
  ];

  const inactiveColor = dark ? '#A1A1AA' : '#52525B';

  const getIconColor = (path: string) => {
    if (pathname === path) return primaryColor;
    return inactiveColor;
  };

  const getLabelStyle = (path: string) => {
    if (pathname === path) return { color: primaryColor, fontWeight: '700' as const };
    return { color: inactiveColor };
  };

  const fabBorderColor = dark ? '#27272A' : '#F4F4F5';

  // SVG Path calculation for the curved tab bar
  const center = SCREEN_WIDTH / 2;
  const cutoutRadius = 42;
  const cornerRadius = 12;

  // Path description:
  // Starts top-left, goes to center cutout, creates smooth curve, goes to top-right, down and back to start.
  const d = `
    M 0 0
    L ${center - cutoutRadius - cornerRadius} 0
    Q ${center - cutoutRadius} 0, ${center - cutoutRadius} ${cornerRadius}
    A ${cutoutRadius} ${cutoutRadius} 0 0 0 ${center + cutoutRadius} ${cornerRadius}
    Q ${center + cutoutRadius} 0, ${center + cutoutRadius + cornerRadius} 0
    L ${SCREEN_WIDTH} 0
    V ${totalHeight}
    H 0
    Z
  `;

  const handlePress = (tab: (typeof tabs)[0]) => {
    if (tab.id === 'profile' && !isAuthenticated) {
      router.replace({ pathname: '/login', params: { redirectTo: '/profile' } as any });
      return;
    }
    router.replace(tab.path as any);
  };

  const Background = () => (
    <View style={StyleSheet.absoluteFill}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={dark ? 80 : 95}
          tint={dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: dark ? '#18181B' : '#FFFFFF', opacity: 0.95 },
          ]}
        />
      )}
      <Svg width={SCREEN_WIDTH} height={totalHeight} style={{ position: 'absolute', top: 0 }}>
        <Path d={d} fill={dark ? '#18181B' : '#FFFFFF'} />
      </Svg>
    </View>
  );

  return (
    <View pointerEvents='box-none' style={[styles.container, { height: totalHeight }]}>
      <Background />

      <View style={[styles.tabsContainer, { height: tabHeight }]}>
        {tabs.map((tab, index) => {
          if (tab.isCenter) {
            return <View key={tab.id} style={styles.centerSpace} pointerEvents='none' />;
          }

          return (
            <Pressable
              key={tab.id}
              onPress={() => handlePress(tab)}
              style={styles.tab}
              accessibilityRole='button'>
              <Ionicons
                name={(pathname === tab.path ? tab.icon : `${tab.icon}-outline`) as any}
                size={22}
                color={getIconColor(tab.path)}
              />
              <Text style={[styles.label, getLabelStyle(tab.path)]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Floating Center Button */}
      <View style={styles.centerButtonContainer} pointerEvents='box-none'>
        <Pressable
          onPress={() => router.push({ pathname: '/carte', params: { action: 'report' } as any })}
          style={[
            styles.centerButton,
            styles.centerButtonShadow,
            { backgroundColor: primaryColor, borderColor: fabBorderColor },
          ]}>
          <Ionicons name='paper-plane' size={24} color='#FFFFFF' />
        </Pressable>
        <Text style={[styles.centerLabel, { color: dark ? '#FFFFFF' : primaryColor }]}>
          Signaler
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  centerSpace: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -15, // Lift it up
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F4F4F5',
  },
  centerButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
});

export default BottomBar;
