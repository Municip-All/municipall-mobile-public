import axios, { isAxiosError } from 'axios';
import * as Location from 'expo-location';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import MapPinMarker from '@components/MapPinMarker';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { reportService, Report } from '../services/reportService';
import {
  transportService,
  TRANSPORT_SEARCH_RADIUS_M,
  type TransportStopMarker,
} from '../services/transportService';
import {
  groupReportsByLocation,
  dominantReportStatusDot,
  type ReportLocationGroup,
} from '../lib/groupReportsByLocation';
import { distanceMeters } from '../lib/geoDistance';

const TRANSPORT_REFETCH_DEBOUNCE_MS = 1200;
/** Ne relance l'API que si le centre carte a bougé d'au moins cette distance. */
const TRANSPORT_REFETCH_MIN_MOVE_M = 600;

export interface MapComponentMethods {
  centerOnUserLocation: () => void;
  goToNearestCompost: () => Promise<void> | void;
  zoomIn: () => void;
  zoomOut: () => void;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type GeoPoint = { lat: number; lon: number };
type Compost = { operateur?: string; adresse?: string; geo_point_2d: GeoPoint };
type Toilet = { adresse?: string; geo_point_2d: GeoPoint };

interface MapComponentProps {
  showComposts?: boolean;
  showToilets?: boolean;
  showReports?: boolean;
  showTransports?: boolean;
  onReportGroupPress?: (group: ReportLocationGroup) => void;
  onTransportStopPress?: (stop: TransportStopMarker) => void;
}

const MapComponent = forwardRef<MapComponentMethods, MapComponentProps>((props, ref) => {
  const {
    showComposts = true,
    showToilets = true,
    showReports = true,
    showTransports = false,
    onReportGroupPress,
    onTransportStopPress,
  } = props || {};
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const { config, tenantId } = useCity();
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [compostMarkers, setCompostMarkers] = useState<Compost[]>([]);
  const [toiletsMarkers, setToiletsMarkers] = useState<Toilet[]>([]);
  const [citizenReports, setCitizenReports] = useState<Report[]>([]);
  const [transportMarkers, setTransportMarkers] = useState<TransportStopMarker[]>([]);
  const [transportZoneCenter, setTransportZoneCenter] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region | null>(null);
  const transportFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transportAbortRef = useRef<AbortController | null>(null);
  const transportRequestIdRef = useRef(0);
  const lastTransportFetchCenterRef = useRef<{ lat: number; lon: number } | null>(null);
  const transportLoadingRef = useRef(false);

  const primaryColor = config?.theme.primaryColor || '#2563EB';
  const transportEnabled =
    (config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false;

  const ZOOM_FACTOR = 0.5;
  const MIN_DELTA = 0.002;
  const MAX_DELTA = 2;

  const zoomByFactor = (factor: number) => {
    const current = regionRef.current;
    if (!current || !mapRef.current) return;

    const next: Region = {
      ...current,
      latitudeDelta: Math.min(Math.max(current.latitudeDelta * factor, MIN_DELTA), MAX_DELTA),
      longitudeDelta: Math.min(Math.max(current.longitudeDelta * factor, MIN_DELTA), MAX_DELTA),
    };
    regionRef.current = next;
    mapRef.current.animateToRegion(next, 280);
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomByFactor(ZOOM_FACTOR),
    zoomOut: () => zoomByFactor(1 / ZOOM_FACTOR),
    centerOnUserLocation: () => {
      if (location && mapRef.current) {
        const region: Region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        regionRef.current = region;
        mapRef.current.animateToRegion(region, 500);
      }
    },
    goToNearestCompost: async () => {
      if (!location) return;
      const nearestCompost = findNearestCompost(location, compostMarkers);
      if (nearestCompost && mapRef.current) {
        const region: Region = {
          latitude: nearestCompost.geo_point_2d.lat,
          longitude: nearestCompost.geo_point_2d.lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        regionRef.current = region;
        mapRef.current.animateToRegion(region, 500);
      }
    },
  }));

  const fetchCitizenReports = async () => {
    try {
      const reports = await reportService.getReports();
      setCitizenReports(reports);
    } catch (error) {
      console.error('Failed to fetch citizen reports', error);
    }
  };

  useEffect(() => {
    const fetchCompostMarkers = async () => {
      try {
        const response = await axios.get(
          'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/dechets-menagers-points-dapport-volontaire-composteurs/records?limit=30'
        );
        const compostData: Compost[] = response.data.results.map((record: any) => ({
          operateur: record.operateur,
          adresse: record.adresse,
          geo_point_2d: {
            lat: record.geo_point_2d?.lat ?? 0,
            lon: record.geo_point_2d?.lon ?? 0,
          },
        }));
        setCompostMarkers(compostData);
      } catch (error) {
        console.error('Failed to fetch compost markers', error);
      }
    };

    const fetchToiletsMarkers = async () => {
      let toilets: Toilet[] = [];

      const limit = 50; // Reduced limit for faster dev loading

      try {
        const response = await axios.get(
          `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/sanisettesparis/records?limit=${limit}`
        );
        const data = response.data.results as any[];

        toilets = data.map((record) => ({
          adresse: record.adresse || 'Adresse non disponible',
          geo_point_2d: record.geo_point_2d
            ? {
                lat: record.geo_point_2d.lat ?? 0,
                lon: record.geo_point_2d.lon ?? 0,
              }
            : { lat: 0, lon: 0 },
        }));
        setToiletsMarkers(toilets);
      } catch (error) {
        console.error('Failed to fetch toilets markers', error);
      }
    };

    const initializeData = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission not granted');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
        setTransportZoneCenter({
          lat: userLocation.coords.latitude,
          lon: userLocation.coords.longitude,
        });
        regionRef.current = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        await Promise.all([fetchCompostMarkers(), fetchToiletsMarkers()]);
      } catch (error) {
        console.error('Error during data initialization', error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCitizenReports([]);
      return;
    }
    void fetchCitizenReports();
  }, [isAuthenticated]);

  const abortTransportFetch = useCallback(() => {
    transportAbortRef.current?.abort();
    transportAbortRef.current = null;
  }, []);

  const loadTransportMarkers = useCallback(
    async (center: { lat: number; lon: number }, force = false) => {
      if (!showTransports || !transportEnabled || !tenantId) return;

      const last = lastTransportFetchCenterRef.current;
      if (
        !force &&
        last &&
        distanceMeters(last.lat, last.lon, center.lat, center.lon) < TRANSPORT_REFETCH_MIN_MOVE_M
      ) {
        return;
      }

      if (transportLoadingRef.current && !force) return;

      abortTransportFetch();
      const controller = new AbortController();
      transportAbortRef.current = controller;
      const requestId = ++transportRequestIdRef.current;
      transportLoadingRef.current = true;

      try {
        const data = await transportService.getDisruptions(tenantId, center.lat, center.lon, {
          signal: controller.signal,
        });
        if (requestId !== transportRequestIdRef.current) return;

        lastTransportFetchCenterRef.current = center;
        setTransportZoneCenter(center);
        setTransportMarkers(data.stops ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (isAxiosError(error) && error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch transport markers', error);
      } finally {
        if (requestId === transportRequestIdRef.current) {
          transportLoadingRef.current = false;
        }
      }
    },
    [abortTransportFetch, showTransports, tenantId, transportEnabled]
  );

  useEffect(() => {
    if (!showTransports || !transportEnabled || !tenantId) {
      abortTransportFetch();
      lastTransportFetchCenterRef.current = null;
      setTransportMarkers([]);
      setTransportZoneCenter(null);
      return;
    }

    const center = regionRef.current
      ? { lat: regionRef.current.latitude, lon: regionRef.current.longitude }
      : location
        ? { lat: location.coords.latitude, lon: location.coords.longitude }
        : null;

    if (center) {
      void loadTransportMarkers(center, true);
    }
  }, [
    showTransports,
    transportEnabled,
    tenantId,
    location,
    loadTransportMarkers,
    abortTransportFetch,
  ]);

  useEffect(
    () => () => {
      if (transportFetchTimerRef.current) clearTimeout(transportFetchTimerRef.current);
      abortTransportFetch();
    },
    [abortTransportFetch]
  );

  const scheduleTransportZoneUpdate = useCallback(
    (region: Region) => {
      if (!showTransports || !transportEnabled) return;
      if (transportFetchTimerRef.current) clearTimeout(transportFetchTimerRef.current);
      transportFetchTimerRef.current = setTimeout(() => {
        void loadTransportMarkers({ lat: region.latitude, lon: region.longitude });
      }, TRANSPORT_REFETCH_DEBOUNCE_MS);
    },
    [loadTransportMarkers, showTransports, transportEnabled]
  );

  const transportZoneHasDisruption = transportMarkers.some((m) => m.status === 'disrupted');

  const reportGroups = useMemo(() => groupReportsByLocation(citizenReports), [citizenReports]);

  const findNearestCompost = (
    userLocation: Location.LocationObject,
    composts: Compost[]
  ): Compost | null => {
    let minDistance = Infinity;
    let nearestCompost: Compost | null = null;

    composts.forEach((compost) => {
      const compostLat = compost.geo_point_2d.lat;
      const compostLon = compost.geo_point_2d.lon;

      const distance = getDistanceFromLatLonInKm(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        compostLat,
        compostLon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestCompost = compost;
      }
    });

    return nearestCompost;
  };

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  return (
    <View className={`flex-1 ${dark ? 'bg-black' : 'bg-white'}`}>
      {location ? (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          onRegionChangeComplete={(region) => {
            regionRef.current = region;
            scheduleTransportZoneUpdate(region);
          }}>
          {showTransports && transportEnabled && transportZoneCenter ? (
            <Circle
              center={{
                latitude: transportZoneCenter.lat,
                longitude: transportZoneCenter.lon,
              }}
              radius={TRANSPORT_SEARCH_RADIUS_M}
              strokeColor={
                transportZoneHasDisruption ? 'rgba(255, 149, 0, 0.85)' : 'rgba(0, 122, 255, 0.75)'
              }
              fillColor={
                transportZoneHasDisruption ? 'rgba(255, 149, 0, 0.12)' : 'rgba(0, 122, 255, 0.1)'
              }
              strokeWidth={2}
            />
          ) : null}

          {/* Public Infrastructure */}
          {showComposts &&
            compostMarkers.map((marker, index) => (
              <MapPinMarker
                key={`compost-${index}`}
                kind='composte'
                coordinate={{
                  latitude: marker.geo_point_2d.lat,
                  longitude: marker.geo_point_2d.lon,
                }}
                title={marker.operateur || 'Composteur'}
                description={marker.adresse}
              />
            ))}

          {showToilets &&
            toiletsMarkers.map((marker, index) => (
              <MapPinMarker
                key={`toilet-${index}`}
                kind='toilet'
                coordinate={{
                  latitude: marker.geo_point_2d.lat,
                  longitude: marker.geo_point_2d.lon,
                }}
                title='Toilette publique'
                description={marker.adresse}
              />
            ))}

          {showReports &&
            reportGroups.map((group) => (
              <MapPinMarker
                key={`report-group-${group.key}`}
                kind='report'
                statusDot={dominantReportStatusDot(group.reports)}
                badgeCount={group.reports.length}
                coordinate={{
                  latitude: group.lat,
                  longitude: group.lon,
                }}
                onPress={() => onReportGroupPress?.(group)}
              />
            ))}

          {showTransports &&
            transportEnabled &&
            transportMarkers.map((marker) => (
              <MapPinMarker
                key={`transport-${marker.stopId}`}
                kind='transport'
                statusDot={marker.status === 'disrupted' ? 'orange' : undefined}
                coordinate={{
                  latitude: marker.lat,
                  longitude: marker.lon,
                }}
                onPress={() => onTransportStopPress?.(marker)}
              />
            ))}
        </MapView>
      ) : (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color={primaryColor} />
          <Text className={`mt-4 ${dark ? 'text-white' : 'text-black'}`}>
            Chargement de la carte...
          </Text>
        </View>
      )}
    </View>
  );
});

export default MapComponent;
