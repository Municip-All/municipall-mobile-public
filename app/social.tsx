import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AssociationCategory, CityAssociation } from '../services/cityService';

const CATEGORY_LABELS: Record<AssociationCategory, string> = {
  association: 'Association',
  'groupe-parole': 'Groupe de parole',
  autre: 'Autre',
};

const CATEGORY_ICONS: Record<AssociationCategory, keyof typeof Ionicons.glyphMap> = {
  association: 'people-outline',
  'groupe-parole': 'chatbubbles-outline',
  autre: 'heart-outline',
};

function AssociationCard({
  item,
  dark,
  primaryColor,
}: {
  item: CityAssociation;
  dark: boolean;
  primaryColor: string;
}) {
  const contactPhone = item.contactPhone;
  const contactEmail = item.contactEmail;

  const openLink = (url: string) => {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(normalized).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir ce lien.");
    });
  };

  return (
    <View
      className={`mb-3 rounded-[24px] border p-5 ${
        dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
      }`}>
      <View className='mb-2 flex-row items-start gap-3'>
        <View
          className='h-11 w-11 items-center justify-center rounded-2xl'
          style={{ backgroundColor: `${primaryColor}15` }}>
          <Ionicons name={CATEGORY_ICONS[item.category]} size={22} color={primaryColor} />
        </View>
        <View className='min-w-0 flex-1'>
          <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-black'}`}>
            {item.name}
          </Text>
          <Text className={`mt-0.5 text-[10px] font-bold tracking-wide text-zinc-400 uppercase`}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </View>
      </View>
      {item.description ? (
        <Text className={`mb-3 text-sm leading-5 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {item.description}
        </Text>
      ) : null}
      {item.address ? (
        <View className='mb-3 flex-row gap-2'>
          <Ionicons
            name='location-outline'
            size={16}
            color={primaryColor}
            style={{ marginTop: 2 }}
          />
          <Text className={`flex-1 text-sm leading-5 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {item.address}
          </Text>
        </View>
      ) : null}
      <View className='flex-row flex-wrap gap-2'>
        {contactEmail ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
            className={`flex-row items-center rounded-full px-3 py-2 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
            <Ionicons name='mail-outline' size={14} color={primaryColor} />
            <Text
              className={`ml-1.5 text-xs font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              E-mail
            </Text>
          </TouchableOpacity>
        ) : null}
        {contactPhone ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${contactPhone.replace(/\s/g, '')}`)}
            className={`flex-row items-center rounded-full px-3 py-2 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
            <Ionicons name='call-outline' size={14} color={primaryColor} />
            <Text
              className={`ml-1.5 text-xs font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              Appeler
            </Text>
          </TouchableOpacity>
        ) : null}
        {item.website ? (
          <TouchableOpacity
            onPress={() => openLink(item.website!)}
            className={`flex-row items-center rounded-full px-3 py-2 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
            <Ionicons name='globe-outline' size={14} color={primaryColor} />
            <Text
              className={`ml-1.5 text-xs font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              Site web
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function SocialScreen() {
  const { dark, primaryColor, classes, layoutStyles, brand } = useAppTheme();
  const { config } = useCity();
  const insets = useSafeAreaInsets();

  const associations = useMemo(() => config?.associations ?? [], [config?.associations]);
  const grouped = useMemo(() => {
    const map: Record<AssociationCategory, CityAssociation[]> = {
      association: [],
      'groupe-parole': [],
      autre: [],
    };
    for (const a of associations) {
      map[a.category]?.push(a);
    }
    return map;
  }, [associations]);

  const cityLabel = config?.officialName || config?.name || brand.appName;

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View className='mb-6'>
          <Text className={classes.eyebrow}>Vie locale</Text>
          <Text className={classes.title}>Social</Text>
          <Text className={`mt-2 text-sm leading-5 ${classes.body}`}>
            Associations, groupes de parole et initiatives citoyennes référencés par la mairie de{' '}
            {cityLabel}.
          </Text>
        </View>

        {associations.length === 0 ? (
          <View className={`items-center rounded-[28px] p-10 ${classes.card}`}>
            <Ionicons name='heart-outline' size={48} color={dark ? '#3f3f46' : '#d4d4d8'} />
            <Text className={`mt-4 text-center text-sm ${classes.body}`}>
              Aucune association référencée pour le moment. La mairie complètera cette liste
              prochainement.
            </Text>
          </View>
        ) : (
          (Object.keys(grouped) as AssociationCategory[]).map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            return (
              <View key={category} className='mb-6'>
                <Text className={`mb-3 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
                  {CATEGORY_LABELS[category]}s
                </Text>
                {items.map((item) => (
                  <AssociationCard
                    key={item.id}
                    item={item}
                    dark={dark}
                    primaryColor={primaryColor}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
