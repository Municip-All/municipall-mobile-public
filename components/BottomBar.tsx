import { View, Pressable, Text, Platform, Dimensions, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@context/authcontext';
import { useAppTheme } from '@hooks/useAppTheme';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ensureCanReport } from '../lib/requireAuthForReport';
import { useCityServicesAccess } from '@hooks/useCityServicesAccess';
import type { IconName, RouteHref } from '../lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_BAR_HEIGHT = 60;
const FAB_SIZE = 56;
const FAB_RING = 4;
const FAB_LIFT = -24;
const CUTOUT_RADIUS = 36;
const CURVE_DEPTH = 26;

type TabItem = {
  id: string;
  label: string;
  icon: IconName;
  path: string;
  isCenter?: boolean;
};

const TABS: TabItem[] = [
  { id: 'home', label: 'Accueil', icon: 'home', path: '/home' },
  { id: 'events', label: 'Événements', icon: 'calendar', path: '/events' },
  { id: 'center', label: 'Signaler', icon: 'paper-plane', path: '/carte', isCenter: true },
  { id: 'contact', label: 'Contact', icon: 'chatbubble', path: '/contact' },
  { id: 'profile', label: 'Profil', icon: 'person', path: '/profile' },
];

/** Courbe symétrique pour encaisser le bouton central (sans angles durs). */
function buildTabBarPath(width: number, height: number): string {
  const center = width / 2;
  const left = center - CUTOUT_RADIUS - 22;
  const right = center + CUTOUT_RADIUS + 22;
  const d = CURVE_DEPTH;

  return `
    M 0 0
    H ${left}
    C ${center - CUTOUT_RADIUS - 6} 0 ${center - CUTOUT_RADIUS} 0 ${center - CUTOUT_RADIUS + 8} ${d * 0.4}
    C ${center - CUTOUT_RADIUS * 0.5} ${d} ${center - CUTOUT_RADIUS * 0.22} ${d} ${center} ${d}
    C ${center + CUTOUT_RADIUS * 0.22} ${d} ${center + CUTOUT_RADIUS * 0.5} ${d} ${center + CUTOUT_RADIUS - 8} ${d * 0.4}
    C ${center + CUTOUT_RADIUS} 0 ${center + CUTOUT_RADIUS + 6} 0 ${right} 0
    H ${width}
    V ${height}
    H 0
    Z
  `;
}

const BottomBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useTheme();
  const { primaryColor, colors, brand } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const { cityServicesEnabled } = useCityServicesAccess();
  const insets = useSafeAreaInsets();
  const dark = colorScheme === 'dark';

  const totalHeight = TAB_BAR_HEIGHT + insets.bottom;
  const surfaceColor = dark ? '#18181B' : '#FFFFFF';
  const inactiveColor = dark ? '#71717A' : '#6B7280';
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const tabBarPath = buildTabBarPath(SCREEN_WIDTH, totalHeight);
  const isCarteActive = pathname === '/carte';

  const handlePress = (tab: TabItem) => {
    if (tab.id === 'profile' && !isAuthenticated) {
      router.replace({ pathname: '/login', params: { redirectTo: '/profile' } } as RouteHref);
      return;
    }
    router.replace(tab.path as RouteHref);
  };

  const Background = () => (
    <View style={StyleSheet.absoluteFill}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={dark ? 72 : 88}
          tint={dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: surfaceColor,
            opacity: Platform.OS === 'ios' ? 0.92 : 0.98,
          },
        ]}
      />
      <Svg width={SCREEN_WIDTH} height={totalHeight} style={styles.svgLayer}>
        <Path d={tabBarPath} fill={surfaceColor} />
        <Path
          d={`M 0 0.5 H ${SCREEN_WIDTH}`}
          stroke={borderColor}
          strokeWidth={StyleSheet.hairlineWidth}
        />
      </Svg>
    </View>
  );

  return (
    <View
      pointerEvents='box-none'
      style={[
        styles.container,
        styles.containerShadow,
        { height: totalHeight, shadowOpacity: dark ? 0.35 : 0.1 },
      ]}>
      <Background />

      <View style={[styles.tabsContainer, { height: TAB_BAR_HEIGHT }]}>
        {TABS.map((tab) => {
          if (tab.isCenter) {
            return <View key={tab.id} style={styles.centerSpace} pointerEvents='none' />;
          }

          const active = pathname === tab.path;
          const iconName = (active ? tab.icon : `${tab.icon}-outline`) as IconName;

          return (
            <Pressable
              key={tab.id}
              onPress={() => handlePress(tab)}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              accessibilityRole='button'
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}>
              <View
                style={[
                  styles.tabIconWrap,
                  active && {
                    backgroundColor: dark ? 'rgba(255,255,255,0.08)' : `${primaryColor}14`,
                  },
                ]}>
                <Ionicons name={iconName} size={22} color={active ? primaryColor : inactiveColor} />
              </View>
              <Text
                style={[
                  styles.label,
                  active
                    ? { color: primaryColor, fontFamily: 'Inter_700Bold' }
                    : { color: inactiveColor },
                ]}
                numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.centerButtonContainer} pointerEvents='box-none'>
        <Pressable
          onPress={() => {
            if (!ensureCanReport(isAuthenticated, cityServicesEnabled, router)) return;
            router.push({ pathname: '/carte', params: { action: 'report' } } as RouteHref);
          }}
          style={({ pressed }) => [
            styles.centerButton,
            {
              backgroundColor: primaryColor,
              borderColor: surfaceColor,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
            isCarteActive && styles.centerButtonActiveRing,
            isCarteActive && { borderColor: `${primaryColor}40` },
          ]}
          accessibilityRole='button'
          accessibilityLabel='Signaler'
          accessibilityState={{ selected: isCarteActive }}>
          <Ionicons name='paper-plane' size={26} color={brand.onPrimary} />
        </Pressable>
        <Text
          style={[
            styles.centerLabel,
            {
              color: isCarteActive || !dark ? primaryColor : '#FFFFFF',
              fontFamily: isCarteActive ? 'Inter_700Bold' : 'Inter_600SemiBold',
            },
          ]}>
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
  containerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    minHeight: 48,
  },
  tabPressed: {
    opacity: 0.75,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  centerSpace: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: FAB_LIFT,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: FAB_RING,
    shadowColor: '#0B0080',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
  centerButtonActiveRing: {
    shadowOpacity: 0.38,
    shadowRadius: 18,
  },
  centerLabel: {
    fontSize: 11,
    marginTop: 5,
    letterSpacing: 0.2,
  },
});

export default BottomBar;
