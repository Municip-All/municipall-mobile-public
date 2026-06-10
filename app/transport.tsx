import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  transportService,
  type TransportLineDisruption,
  type TransportMode,
} from '../services/transportService';

function modeIcon(mode: TransportMode): keyof typeof Ionicons.glyphMap {
  switch (mode) {
    case 'metro':
      return 'subway';
    case 'rer':
    case 'train':
      return 'train';
    case 'tram':
      return 'git-branch';
    case 'bus':
      return 'bus';
    default:
      return 'ellipse';
  }
}

function modeLabel(mode: TransportMode): string {
  switch (mode) {
    case 'metro':
      return 'Métro';
    case 'rer':
      return 'RER';
    case 'train':
      return 'Train';
    case 'tram':
      return 'Tramway';
    case 'bus':
      return 'Bus';
    default:
      return 'Transport';
  }
}

function LineCard({ line, dark }: { line: TransportLineDisruption; dark: boolean }) {
  const disrupted = line.status === 'disrupted';
  const statusColor = disrupted ? '#FF9500' : '#34C759';
  const statusLabel = disrupted ? 'Perturbation' : 'Trafic normal';

  return (
    <View
      className={`mb-4 overflow-hidden rounded-[28px] border shadow-sm ${
        dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
      }`}>
      <View className='flex-row items-start p-5'>
        <View
          className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
          style={{ backgroundColor: `${statusColor}22` }}>
          <Ionicons name={modeIcon(line.mode)} size={24} color={statusColor} />
        </View>
        <View className='flex-1'>
          <View className='flex-row items-center justify-between gap-2'>
            <Text className={`flex-1 text-base font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>
              {line.lineName}
            </Text>
            <View
              className='rounded-full px-3 py-1'
              style={{ backgroundColor: `${statusColor}18` }}>
              <Text style={{ color: statusColor, fontSize: 10, fontWeight: '800' }}>
                {statusLabel.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text
            className={`mt-1 text-xs font-semibold ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {modeLabel(line.mode)}
          </Text>
          {line.messages.length > 0 ? (
            <View className='mt-3'>
              {line.messages.map((msg, i) => (
                <Text
                  key={`${line.lineId}-${i}`}
                  className={`text-sm leading-5 ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                  {msg}
                </Text>
              ))}
            </View>
          ) : (
            <Text className={`mt-3 text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Circulation normale sur cette ligne à proximité.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function TransportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark, primaryColor, classes, layoutStyles } = useAppTheme();
  const { config, tenantId } = useCity();

  const transportEnabled =
    (config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false;

  const [lines, setLines] = useState<TransportLineDisruption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDisruptions = useCallback(async () => {
    if (!transportEnabled || !tenantId) {
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Autorisez la localisation pour voir les transports à proximité.');
        setLines([]);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const data = await transportService.getDisruptions(
        tenantId,
        position.coords.latitude,
        position.coords.longitude
      );
      setLines(data.lines);
    } catch (e) {
      console.error(e);
      const apiMessage =
        e &&
        typeof e === 'object' &&
        'response' in e &&
        e.response &&
        typeof e.response === 'object' &&
        'data' in e.response &&
        e.response.data &&
        typeof e.response.data === 'object' &&
        'message' in e.response.data &&
        typeof e.response.data.message === 'string'
          ? e.response.data.message
          : null;
      setError(apiMessage ?? 'Impossible de charger les perturbations. Réessayez dans un instant.');
      setLines([]);
    }
  }, [tenantId, transportEnabled]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadDisruptions().finally(() => setLoading(false));
    }, [loadDisruptions])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDisruptions();
    setRefreshing(false);
  };

  if (!transportEnabled) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Ionicons name='bus-outline' size={48} color={primaryColor} />
        <Text className={`mt-4 text-center ${classes.body}`}>
          Le module transports n&apos;est pas activé pour votre commune.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className='mt-6'>
          <Text style={{ color: primaryColor, fontWeight: '700' }}>Retour</Text>
        </TouchableOpacity>
        <BottomBar />
      </View>
    );
  }

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }>
        <TouchableOpacity onPress={() => router.back()} className='mb-4 flex-row items-center'>
          <Ionicons name='chevron-back' size={22} color={primaryColor} />
          <Text style={{ color: primaryColor, fontWeight: '700', marginLeft: 4 }}>Retour</Text>
        </TouchableOpacity>

        <Text className={classes.title}>Transports</Text>
        <Text className={`mt-2 ${classes.subtitle}`}>
          Perturbations en temps réel autour de vous (IDFM)
        </Text>

        {loading ? (
          <View className='items-center py-16'>
            <ActivityIndicator color={primaryColor} size='large' />
            <Text className={`mt-4 ${classes.body}`}>Recherche des lignes à proximité…</Text>
          </View>
        ) : error ? (
          <View className={`mt-6 p-5 ${classes.cardRounded}`}>
            <Text className={classes.body}>{error}</Text>
            <TouchableOpacity onPress={onRefresh} className='mt-4'>
              <Text style={{ color: primaryColor, fontWeight: '700' }}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : lines.length === 0 ? (
          <View className={`mt-6 p-5 ${classes.cardRounded}`}>
            <Text className={classes.body}>
              Aucune ligne trouvée à proximité. Déplacez-vous ou réessayez plus tard.
            </Text>
          </View>
        ) : (
          <View className='mt-6'>
            {lines.map((line) => (
              <LineCard key={line.lineId} line={line} dark={dark} />
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
