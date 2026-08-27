import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/BottomBar';
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

function AssociationCard({ item }: { item: CityAssociation }) {
  const { dark, primaryColor, classes, colors } = useAppTheme();
  const contactPhone = item.contactPhone;
  const contactEmail = item.contactEmail;

  const openLink = (url: string) => {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(normalized).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir ce lien.");
    });
  };

  return (
    <View className={`mb-3 p-5 ${classes.cardRounded}`}>
      <View className='mb-2 flex-row items-start gap-3'>
        <View
          className='h-11 w-11 items-center justify-center rounded-2xl'
          style={{ backgroundColor: colors.primaryTint }}>
          <Ionicons name={CATEGORY_ICONS[item.category]} size={22} color={primaryColor} />
        </View>
        <View className='min-w-0 flex-1'>
          <Text className={`text-base font-bold ${dark ? 'text-night-text' : 'text-matcha-900'}`}>
            {item.name}
          </Text>
          <Text className={`mt-0.5 tracking-wide uppercase ${classes.caption}`}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </View>
      </View>
      {item.description ? <Text className={`mb-3 ${classes.body}`}>{item.description}</Text> : null}
      {item.address ? (
        <View className='mb-3 flex-row gap-2'>
          <Ionicons
            name='location-outline'
            size={16}
            color={primaryColor}
            style={{ marginTop: 2 }}
          />
          <Text className={`flex-1 ${classes.body}`}>{item.address}</Text>
        </View>
      ) : null}
      <View className='flex-row flex-wrap gap-2'>
        {contactEmail ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
            accessibilityLabel={`Envoyer un e-mail à ${item.name}`}
            className={`flex-row items-center rounded-full px-3 py-2 ${
              dark ? 'bg-night-elevated' : 'bg-cream-100'
            }`}>
            <Ionicons name='mail-outline' size={14} color={primaryColor} />
            <Text
              className={`ml-1.5 text-xs font-semibold ${
                dark ? 'text-night-text' : 'text-charcoal'
              }`}>
              E-mail
            </Text>
          </TouchableOpacity>
        ) : null}
        {contactPhone ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${contactPhone.replace(/\s/g, '')}`)}
            accessibilityLabel={`Appeler ${item.name}`}
            className={`flex-row items-center rounded-full px-3 py-2 ${
              dark ? 'bg-night-elevated' : 'bg-cream-100'
            }`}>
            <Ionicons name='call-outline' size={14} color={primaryColor} />
            <Text
              className={`ml-1.5 text-xs font-semibold ${
                dark ? 'text-night-text' : 'text-charcoal'
              }`}>
              Appeler
            </Text>
          </TouchableOpacity>
        ) : null}
        {item.website ? (
          <TouchableOpacity
            onPress={() => openLink(item.website!)}
            accessibilityLabel={`Site web de ${item.name}`}
            className={`flex-row items-center rounded-full px-3 py-2 ${
              dark ? 'bg-night-elevated' : 'bg-cream-100'
            }`}>
            <Ionicons name='globe-outline' size={14} color={primaryColor} />
            <Text
              className={`ml-1.5 text-xs font-semibold ${
                dark ? 'text-night-text' : 'text-charcoal'
              }`}>
              Site web
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default function SocialScreen() {
  const { dark, primaryColor, classes, colors, layoutStyles, brand } = useAppTheme();
  const { config, refreshConfig, loading } = useCity();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshConfig();
      setError(null);
    } catch {
      setError('Impossible de charger les associations.');
    }
    setRefreshing(false);
  }, [refreshConfig]);

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

  if (loading) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Text className={`text-center text-base ${classes.body}`}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            onRefresh();
          }}
          className='mt-4 rounded-xl px-6 py-3'
          style={{ backgroundColor: primaryColor }}>
          <Text className='font-bold' style={{ color: colors.onPrimary }}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }>
        <View className='mb-6'>
          <Text className={classes.eyebrow}>Vie locale</Text>
          <Text className={classes.title}>Social</Text>
          <Text className={`mt-2 ${classes.body}`}>
            Associations, groupes de parole et initiatives citoyennes référencés par la mairie de{' '}
            {cityLabel}.
          </Text>
        </View>

        {associations.length === 0 ? (
          <View className={`items-center p-10 ${classes.cardRounded}`}>
            <Ionicons name='heart-outline' size={48} color={colors.handle} />
            <Text className={`mt-4 text-center ${classes.body}`}>
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
                <Text
                  className={`mb-3 text-sm font-bold ${
                    dark ? 'text-night-text' : 'text-matcha-900'
                  }`}>
                  {CATEGORY_LABELS[category]}s
                </Text>
                {items.map((item) => (
                  <AssociationCard key={item.id} item={item} />
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
