import axios from 'axios';
import * as Location from 'expo-location';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { reportService, Report } from '../services/reportService';

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
}

const MapComponent = forwardRef<MapComponentMethods, MapComponentProps>((props, ref) => {
  const { showComposts = true, showToilets = true, showReports = true } = props || {};
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const { config } = useCity();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [compostMarkers, setCompostMarkers] = useState<Compost[]>([]);
  const [toiletsMarkers, setToiletsMarkers] = useState<Toilet[]>([]);
  const [citizenReports, setCitizenReports] = useState<Report[]>([]);
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region | null>(null);

  const primaryColor = config?.theme.primaryColor || '#2563EB';

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
        regionRef.current = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        await Promise.all([fetchCompostMarkers(), fetchToiletsMarkers(), fetchCitizenReports()]);
      } catch (error) {
        console.error('Error during data initialization', error);
      }
    };

    initializeData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente':
        return '#f97316'; // orange
      case 'En cours':
        return '#3b82f6'; // blue
      case 'Résolu':
        return '#22c55e'; // green
      default:
        return '#9ca3af';
    }
  };

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
          }}>
          {/* Public Infrastructure */}
          {showComposts &&
            compostMarkers.map((marker, index) => (
              <Marker
                key={`compost-${index}`}
                coordinate={{
                  latitude: marker.geo_point_2d.lat,
                  longitude: marker.geo_point_2d.lon,
                }}
                title={marker.operateur || 'Composteur'}
                description={marker.adresse}
                pinColor='#22c55e'
              />
            ))}

          {showToilets &&
            toiletsMarkers.map((marker, index) => (
              <Marker
                key={`toilet-${index}`}
                coordinate={{
                  latitude: marker.geo_point_2d.lat,
                  longitude: marker.geo_point_2d.lon,
                }}
                title='Toilette publique'
                description={marker.adresse}
                pinColor='#0ea5e9'
              />
            ))}

          {/* Citizen Reports */}
          {showReports &&
            citizenReports.map((report) => (
            <Marker
              key={`report-${report.id}`}
              coordinate={{
                latitude: report.lat,
                longitude: report.lon,
              }}
              pinColor={getStatusColor(report.status)}>
              <Callout>
                <View className='min-w-[150px] p-2'>
                  <Text className='font-bold text-slate-900'>{report.category}</Text>
                  <Text className='mt-1 text-xs text-slate-600'>{report.description}</Text>
                  <Text
                    className='mt-2 text-[10px] font-bold'
                    style={{ color: getStatusColor(report.status) }}>
                    {report.status.toUpperCase()}
                  </Text>
                </View>
              </Callout>
            </Marker>
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
