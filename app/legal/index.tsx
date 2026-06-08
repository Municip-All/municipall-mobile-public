import React from 'react';
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

export default function LegalHubScreen() {
  const { dark, classes, colors } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cityLegal = useCityLegalContext();
  const items = LEGAL_HUB_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <View className={`flex-1 ${classes.page}`}>
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
            className={`mb-6 rounded-2xl border p-4 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
            <Text className={classes.meta}>Votre commune — {cityLegal.cityName}</Text>
            <Text className={`mt-2 text-xs leading-5 ${classes.body}`}>
              {cityLegal.dataRetentionPolicy?.trim() ||
                "Durées spécifiques non renseignées : les durées par défaut Municipall s'appliquent (voir politique de confidentialité, section 5)."}
            </Text>
          </View>
        ) : null}

        <View className={`overflow-hidden rounded-[24px] ${classes.listGroup}`}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as any)}
              className={`flex-row items-center p-4 ${i < items.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View
                className='mr-3 h-10 w-10 items-center justify-center rounded-xl'
                style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View className='flex-1'>
                <Text
                  className={`text-sm font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {item.label}
                </Text>
                <Text className={`mt-0.5 text-xs ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <Text
          className={`mt-6 text-center text-[11px] leading-4 ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          Version {LEGAL_ENTITY.documentVersion} — {LEGAL_ENTITY.lastUpdated}
          {'\n'}
          {LEGAL_ENTITY.privacyEmail}
        </Text>
      </ScrollView>
    </View>
  );
}
