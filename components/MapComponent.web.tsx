import React, { forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import * as L from 'leaflet';

export interface MapComponentMethods {
    centerOnUserLocation: () => void;
    goToNearestCompost: () => Promise<void> | void;
}

type GeoPoint = { lat: number; lon: number };
type Compost = { operateur?: string; adresse?: string; geo_point_2d: GeoPoint };
type Toilet = { adresse?: string; geo_point_2d: GeoPoint };

// Use simple colored circle markers; custom image URLs can be added later via L.icon
const compostMarkerOptions: L.CircleMarkerOptions = { radius: 6, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.9 };
const toiletMarkerOptions: L.CircleMarkerOptions = { radius: 6, color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.9 };

// We'll manage map imperatively, no react-leaflet.

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const toRad = (d: number) => (d * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const MapComponent = forwardRef<MapComponentMethods, object>((_props, ref) => {
    const { theme } = useTheme();
    const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
    const [composts, setComposts] = useState<Compost[]>([]);
    const [toilets, setToilets] = useState<Toilet[]>([]);
    const apiRef = useRef<{ centerOnUserLocation: () => void; goToNearestCompost: () => void } | null>(null);
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const compostLayerRef = useRef<L.LayerGroup | null>(null);
    const toiletLayerRef = useRef<L.LayerGroup | null>(null);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
        centerOnUserLocation: () => apiRef.current?.centerOnUserLocation(),
        goToNearestCompost: () => apiRef.current?.goToNearestCompost(),
    }));

    // Fetch geolocation (browser API)
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée par ce navigateur');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation(pos.coords),
            (err) => setError('Impossible de récupérer la position: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
    }, []);

    // Fetch composts (limit lowered for performance on web initial load)
    useEffect(() => {
        const fetchComposts = async () => {
            try {
                const resp = await axios.get(
                    'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/dechets-menagers-points-dapport-volontaire-composteurs/records?limit=50'
                );
                const data: Compost[] = resp.data.results.map((r: any) => ({
                    operateur: r.operateur,
                    adresse: r.adresse,
                    geo_point_2d: { lat: r.geo_point_2d?.lat ?? 0, lon: r.geo_point_2d?.lon ?? 0 },
                }));
                setComposts(data.filter((c) => c.geo_point_2d.lat && c.geo_point_2d.lon));
            } catch (e) {
                console.error(e);
            }
        };
        fetchComposts();
    }, []);

    // Fetch toilets (single page for now)
    useEffect(() => {
        const fetchToilets = async () => {
            try {
                const resp = await axios.get(
                    'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/sanisettesparis/records?limit=100'
                );
                const data: Toilet[] = resp.data.results.map((r: any) => ({
                    adresse: r.adresse || 'Adresse non disponible',
                    geo_point_2d: r.geo_point_2d
                        ? { lat: r.geo_point_2d.lat ?? 0, lon: r.geo_point_2d.lon ?? 0 }
                        : { lat: 0, lon: 0 },
                }));
                setToilets(data.filter((t) => t.geo_point_2d.lat && t.geo_point_2d.lon));
            } catch (e) {
                console.error(e);
            }
        };
        fetchToilets();
    }, []);

    const dark = theme === 'dark';

    // Inject Leaflet CSS once (web only)
    useEffect(() => {
        if (document.getElementById('leaflet-css')) return;
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }, []);

    // Initialize map once
    useEffect(() => {
        if (!mapDivRef.current || mapRef.current) return;
        const initialCenter: L.LatLngExpression = [48.8566, 2.3522];
        const map = L.map(mapDivRef.current, {
            center: initialCenter,
            zoom: 13,
            zoomControl: true,
            attributionControl: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            crossOrigin: true,
        }).addTo(map);
        mapRef.current = map;
        compostLayerRef.current = L.layerGroup().addTo(map);
        toiletLayerRef.current = L.layerGroup().addTo(map);
    }, []);

    // Update user location marker
    useEffect(() => {
        if (!mapRef.current || !userLocation) return;
        const map = mapRef.current;
        const existing = (map as any)._userMarker as L.Marker | undefined;
        const latLng = L.latLng(userLocation.latitude, userLocation.longitude);
        if (existing) {
            existing.setLatLng(latLng);
        } else {
            const m = L.marker(latLng, { title: 'Vous êtes ici' });
            (map as any)._userMarker = m;
            m.addTo(map);
        }
    }, [userLocation]);

    // Render compost markers
    useEffect(() => {
        if (!compostLayerRef.current) return;
        const layer = compostLayerRef.current;
        layer.clearLayers();
        composts.forEach((c) => {
            const { lat, lon } = c.geo_point_2d;
            if (!lat || !lon) return;
            const marker = L.circleMarker([lat, lon], compostMarkerOptions).bindPopup(
                `<strong>${c.operateur || 'Composteur'}</strong><br/>${c.adresse || ''}`
            );
            marker.addTo(layer);
        });
    }, [composts]);

    // Render toilet markers
    useEffect(() => {
        if (!toiletLayerRef.current) return;
        const layer = toiletLayerRef.current;
        layer.clearLayers();
        toilets.forEach((t) => {
            const { lat, lon } = t.geo_point_2d;
            if (!lat || !lon) return;
            const marker = L.circleMarker([lat, lon], toiletMarkerOptions).bindPopup(
                `<strong>Toilette publique</strong><br/>${t.adresse || ''}`
            );
            marker.addTo(layer);
        });
    }, [toilets]);

    // Expose API
    useEffect(() => {
        apiRef.current = {
            centerOnUserLocation: () => {
                if (mapRef.current && userLocation) {
                    mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
                        duration: 0.75,
                    });
                }
            },
            goToNearestCompost: () => {
                if (!mapRef.current || !userLocation || composts.length === 0) return;
                let minDist = Infinity;
                let nearest: Compost | undefined;
                for (const c of composts) {
                    const d = haversine(
                        userLocation.latitude,
                        userLocation.longitude,
                        c.geo_point_2d.lat,
                        c.geo_point_2d.lon
                    );
                    if (d < minDist) {
                        minDist = d;
                        nearest = c;
                    }
                }
                if (nearest) {
                    mapRef.current.flyTo([nearest.geo_point_2d.lat, nearest.geo_point_2d.lon], 16, {
                        duration: 0.75,
                    });
                }
            },
        };
    }, [userLocation, composts]);

    // Default center (Paris)
    return (
        <View className={`flex-1 ${dark ? 'bg-black' : 'bg-white'}`}>
            {error && (
                <View className='absolute top-2 left-2 right-2 z-50 rounded bg-red-600 px-3 py-2'>
                    <Text className='text-xs font-medium text-white'>{error}</Text>
                </View>
            )}
            {/* Use a plain div for Leaflet (web only). React Native Web will pass through unknown elements. */}
            {React.createElement(
                'div',
                {
                    ref: mapDivRef,
                    style: { width: '100%', height: '100%', position: 'relative' },
                },
                !mapRef.current && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text className={`text-sm ${dark ? 'text-white' : 'text-black'}`}>
                            Initialisation de la carte...
                        </Text>
                    </div>
                )
            )}
        </View>
    );
});

export default MapComponent;
