import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/BottomBar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constructionWorksService, ConstructionWork } from '../services/constructionWorksService';
import { useCityServicesAccess } from '@hooks/useCityServicesAccess';
import NoPartnerCityBanner from '@components/NoPartnerCityBanner';

export default function Travaux() {
  const { dark, primaryColor, classes, colors, tintColor, layoutStyles } = useAppTheme();
  const { needsPartnerCity, cityServicesEnabled } = useCityServicesAccess();
  const insets = useSafeAreaInsets();

  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorks = useCallback(async (signal?: { cancelled: boolean }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await constructionWorksService.getWorks();
      if (!signal?.cancelled) setWorks(data);
    } catch {
      if (!signal?.cancelled) setError('Impossible de charger les travaux.');
    } finally {
      if (!signal?.cancelled) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    loadWorks(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadWorks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorks();
    setRefreshing(false);
  }, [loadWorks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours':
        return colors.warning;
      case 'Annulé':
        return colors.destructive;
      case 'Terminé':
        return colors.success;
      default:
        return colors.info;
    }
  };

  const getStatusBg = (status: string) => tintColor(getStatusColor(status), '18');

  if (!cityServicesEnabled) {
    return (
      <View style={layoutStyles.page}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: 120,
            paddingHorizontal: 20,
          }}>
          <View className='mb-8'>
            <Text className={classes.eyebrow}>Infrastructure</Text>
            <Text className={classes.title}>Travaux</Text>
          </View>
          {needsPartnerCity ? (
            <NoPartnerCityBanner />
          ) : (
            <Text className={classes.body}>
              Les informations sur les travaux ne sont pas disponibles pour cette commune.
            </Text>
          )}
        </ScrollView>
        <BottomBar />
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
        <View className='mb-8'>
          <Text className={classes.eyebrow}>Infrastructure</Text>
          <Text className={classes.title}>Travaux</Text>
        </View>

        <View className='space-y-4'>
          {isLoading ? (
            <ActivityIndicator color={primaryColor} size='large' style={{ marginTop: 40 }} />
          ) : error ? (
            <View className='items-center py-20'>
              <Ionicons name='alert-circle-outline' size={48} color={colors.handle} />
              <Text className={`mt-4 text-center ${classes.subtitle}`}>{error}</Text>
              <TouchableOpacity
                onPress={() => loadWorks()}
                className='mt-4'
                accessibilityRole='button'
                accessibilityLabel='Réessayer le chargement'>
                <Text style={{ color: primaryColor }} className='font-bold'>
                  Réessayer
                </Text>
              </TouchableOpacity>
            </View>
          ) : works.length === 0 ? (
            <View className='items-center py-20'>
              <Ionicons name='hammer-outline' size={48} color={colors.handle} />
              <Text className={`mt-4 ${classes.subtitle}`}>Aucun chantier signalé</Text>
            </View>
          ) : (
            works.map((item, i) => (
              <TouchableOpacity key={i} className={`shadow-soft mb-4 ${classes.cardRounded}`}>
                <View className='p-6'>
                  <View className='mb-4 flex-row items-center'>
                    <View
                      className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
                      style={{ backgroundColor: getStatusBg(item.status) }}>
                      <Ionicons name='construct' size={24} color={getStatusColor(item.status)} />
                    </View>
                    <View className='flex-1'>
                      <Text
                        className={`text-xl font-bold ${
                          dark ? 'text-night-text' : 'text-matcha-900'
                        }`}>
                        {item.title}
                      </Text>
                      <Text className={classes.subtitle}>
                        {item.impactType || 'Travaux de voirie'}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`rounded-2xl p-4 ${dark ? 'bg-night-elevated' : 'bg-cream-100'}`}>
                    <View className='mb-2 flex-row items-center justify-between'>
                      <Text className={classes.eyebrow}>STATUT</Text>
                      <Text
                        className='text-xs font-extrabold uppercase'
                        style={{ color: getStatusColor(item.status) }}>
                        {item.status}
                      </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                      <Text className={classes.eyebrow}>PÉRIODE</Text>
                      <Text
                        className={`text-xs font-bold ${
                          dark ? 'text-night-text' : 'text-charcoal'
                        }`}>
                        Du {new Date(item.startDate).toLocaleDateString()} au{' '}
                        {new Date(item.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View
          className={`mt-8 rounded-[20px] border border-dashed p-6 ${
            dark ? 'border-night-border' : 'border-cream-200'
          }`}>
          <Text
            className={`text-center text-xs leading-5 ${dark ? 'text-night-muted' : 'text-muted'}`}>
            Ces informations sont fournies à titre indicatif par les services techniques de la
            ville. Les dates peuvent varier selon les conditions météorologiques.
          </Text>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
