import * as Location from 'expo-location';
import { forwardRef, useCallback, useImperativeHandle, useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import type { CityMapMethods } from '../../lib/map/types';

type Props = {
  latitude: number;
  longitude: number;
  children?: ReactNode;
  onRegionChangeComplete?: (region: Region) => void;
};

const REGION_DELTA = 0.05;
const ZOOM_FACTOR = 0.5;
const MIN_DELTA = 0.002;
const MAX_DELTA = 2;

const NativeMapView = forwardRef<CityMapMethods, Props>(function NativeMapView(
  { latitude, longitude, children, onRegionChangeComplete },
  ref
) {
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region>({
    latitude,
    longitude,
    latitudeDelta: REGION_DELTA,
    longitudeDelta: REGION_DELTA,
  });

  const zoomByFactor = useCallback((factor: number) => {
    const current = regionRef.current;
    if (!current || !mapRef.current) return;

    const next: Region = {
      ...current,
      latitudeDelta: Math.min(Math.max(current.latitudeDelta * factor, MIN_DELTA), MAX_DELTA),
      longitudeDelta: Math.min(Math.max(current.longitudeDelta * factor, MIN_DELTA), MAX_DELTA),
    };
    regionRef.current = next;
    mapRef.current.animateToRegion(next, 280);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomByFactor(ZOOM_FACTOR),
      zoomOut: () => zoomByFactor(1 / ZOOM_FACTOR),
      centerOnUserLocation: () => {
        void (async () => {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const position = await Location.getCurrentPositionAsync({});
            const next: Region = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: regionRef.current.latitudeDelta,
              longitudeDelta: regionRef.current.longitudeDelta,
            };
            regionRef.current = next;
            mapRef.current?.animateToRegion(next, 400);
          } catch (error) {
            console.error('NativeMapView: center on user failed', error);
          }
        })();
      },
    }),
    [zoomByFactor]
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={regionRef.current}
      showsUserLocation
      onRegionChangeComplete={(region) => {
        regionRef.current = region;
        onRegionChangeComplete?.(region);
      }}>
      {children}
    </MapView>
  );
});

export default NativeMapView;

const styles = StyleSheet.create({
  map: { flex: 1 },
});
