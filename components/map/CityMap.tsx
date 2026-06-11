import { forwardRef, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { DEFAULT_MAP_CENTER } from '../../lib/map/constants';
import type { CityMapMethods } from '../../lib/map/types';
import NativeMapView from './NativeMapView';

type Coordinates = {
  latitude: number;
  longitude: number;
};

const CityMap = forwardRef<CityMapMethods>(function CityMap(_props, ref) {
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          if (!cancelled) {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
          return;
        }
      } catch (error) {
        console.error('CityMap: location error', error);
      }

      if (!cancelled) {
        setCoords(DEFAULT_MAP_CENTER);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!coords) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return <NativeMapView ref={ref} latitude={coords.latitude} longitude={coords.longitude} />;
});

export default CityMap;

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
