import { forwardRef, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { DEFAULT_MAP_CENTER } from '../../lib/map/constants';
import type { CityMapMethods } from '../../lib/map/types';
import type { ReportLocationGroup } from '../../lib/groupReportsByLocation';
import type { TransportStopMarker } from '../../services/transportService';
import NativeMapView from './NativeMapView';
import MapMarkerLayer from './MapMarkerLayer';
import { useMapMarkerData } from './useMapMarkerData';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CityMapProps = {
  showComposts?: boolean;
  showToilets?: boolean;
  showReports?: boolean;
  showTransports?: boolean;
  onReportGroupPress?: (group: ReportLocationGroup) => void;
  onTransportStopPress?: (stop: TransportStopMarker) => void;
};

const CityMap = forwardRef<CityMapMethods, CityMapProps>(function CityMap(
  {
    showComposts = true,
    showToilets = true,
    showReports = true,
    showTransports = true,
    onReportGroupPress,
    onTransportStopPress,
  },
  ref
) {
  const [coords, setCoords] = useState<Coordinates | null>(null);

  const {
    compostMarkers,
    toiletMarkers,
    reportGroups,
    transportMarkers,
    transportZoneCenter,
    transportZoneHasDisruption,
    transportEnabled,
    scheduleTransportZoneUpdate,
    dominantReportStatusDot,
  } = useMapMarkerData({
    showReports,
    showTransports,
    mapLat: coords?.latitude,
    mapLon: coords?.longitude,
  });

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

  return (
    <NativeMapView
      ref={ref}
      latitude={coords.latitude}
      longitude={coords.longitude}
      onRegionChangeComplete={(region) => {
        scheduleTransportZoneUpdate({ lat: region.latitude, lon: region.longitude });
      }}>
      <MapMarkerLayer
        showComposts={showComposts}
        showToilets={showToilets}
        showReports={showReports}
        showTransports={showTransports}
        transportEnabled={transportEnabled}
        compostMarkers={compostMarkers}
        toiletMarkers={toiletMarkers}
        reportGroups={reportGroups}
        transportMarkers={transportMarkers}
        transportZoneCenter={transportZoneCenter}
        transportZoneHasDisruption={transportZoneHasDisruption}
        getReportStatusDot={dominantReportStatusDot}
        onReportGroupPress={onReportGroupPress}
        onTransportStopPress={onTransportStopPress}
      />
    </NativeMapView>
  );
});

export default CityMap;

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
