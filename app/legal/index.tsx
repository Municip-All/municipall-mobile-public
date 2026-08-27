import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import { LEGAL_HUB_ITEMS } from '../../constants/legalContent';
import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { useCityLegalContext } from '@hooks/useCityLegalContext';
import type { RouteHref } from '../../lib/types';

export default function LegalHubScreen() {
  const { dark, classes, colors, layoutStyles } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cityLegal = useCityLegalContext();
  const items = LEGAL_HUB_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated);

  const hubColors: Record<string, string> = {
    '#007AFF': colors.info,
    '#34C759': colors.success,
    '#FF9500': colors.warning,
    '#AF52DE': colors.accent,
    '#5856D6': colors.accent,
  };

  return (
    <View style={layoutStyles.page}>
      <ProfileScreenHeader title='Informations légales' />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 8,
        }}>
        <Text className={`mb-4 ${classes.body}`}>
          Transparence sur l&apos;utilisation de {LEGAL_ENTITY.appName} : documents contractuels,
          protection des données (RGPD) et exercice de vos droits. Responsable de traitement :{' '}
          {LEGAL_ENTITY.legalName}.
        </Text>
        {cityLegal.cityName ? (
          <View
            className={`mb-6 rounded-2xl border p-4 ${dark ? 'border-night-border bg-night-surface' : 'border-cream-200 bg-cream-50'}`}>
            <Text className={classes.meta}>Votre commune — {cityLegal.cityName}</Text>
            <Text className={`mt-2 text-xs leading-5 ${classes.body}`}>
              {cityLegal.dataRetentionPolicy?.trim() ||
                "Durées spécifiques non renseignées : les durées par défaut Municipall s'appliquent (voir politique de confidentialité, section 5)."}
            </Text>
          </View>
        ) : null}

        <View className={classes.listGroup}>
          {items.map((item, i) => {
            const color = hubColors[item.color] ?? colors.accent;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route as RouteHref)}
                accessibilityRole='button'
                accessibilityLabel={item.label}
                className={`flex-row items-center p-4 ${i < items.length - 1 ? `border-b ${dark ? 'border-night-border' : 'border-cream-200'}` : ''}`}>
                <View
                  className='mr-3 h-10 w-10 items-center justify-center rounded-xl'
                  style={{ backgroundColor: `${color}15` }}>
                  <Ionicons name={item.icon} size={22} color={color} />
                </View>
                <View className='flex-1'>
                  <Text
                    className={`text-sm font-semibold ${dark ? 'text-night-text' : 'text-charcoal'}`}>
                    {item.label}
                  </Text>
                  <Text className={`mt-0.5 text-xs ${dark ? 'text-night-muted' : 'text-muted'}`}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          className={`mt-6 text-center text-[11px] leading-4 ${dark ? 'text-night-muted' : 'text-muted'}`}>
          Version {LEGAL_ENTITY.documentVersion} — {LEGAL_ENTITY.lastUpdated}
          {'\n'}
          {LEGAL_ENTITY.privacyEmail}
        </Text>
      </ScrollView>
    </View>
  );
}
