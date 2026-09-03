import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { distanceMeters } from '../../lib/geoDistance';
import {
  DEFAULT_MAP_CENTER,
  MARKER_FILTER_MIN_MOVE_M,
} from '../../lib/map/constants';
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
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const mapCenterRef = useRef<Coordinates | null>(null);

  const viewLat = mapCenter?.latitude ?? coords?.latitude;
  const viewLon = mapCenter?.longitude ?? coords?.longitude;

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
    mapLat: viewLat,
    mapLon: viewLon,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          if (!cancelled) {
            const next = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCoords(next);
            mapCenterRef.current = next;
            setMapCenter(next);
          }
          return;
        }
      } catch {
        // fall through to default center
      }

      if (!cancelled) {
        setCoords(DEFAULT_MAP_CENTER);
        mapCenterRef.current = DEFAULT_MAP_CENTER;
        setMapCenter(DEFAULT_MAP_CENTER);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRegionChangeComplete = useCallback(
    (region: { latitude: number; longitude: number }) => {
      const center = { latitude: region.latitude, longitude: region.longitude };
      scheduleTransportZoneUpdate({ lat: center.latitude, lon: center.longitude });

      const prev = mapCenterRef.current;
      if (
        prev &&
        distanceMeters(prev.latitude, prev.longitude, center.latitude, center.longitude) <
          MARKER_FILTER_MIN_MOVE_M
      ) {
        return;
      }

      mapCenterRef.current = center;
      setMapCenter(center);
    },
    [scheduleTransportZoneUpdate]
  );

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
      onRegionChangeComplete={onRegionChangeComplete}>
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
