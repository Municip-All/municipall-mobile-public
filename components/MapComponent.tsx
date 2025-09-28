import axios from "axios";
import * as Location from "expo-location";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { View, Text, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../context/ThemeContext";

export interface MapComponentMethods {
    centerOnUserLocation: () => void;
    goToNearestCompost: () => Promise<void> | void;
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

const MapComponent = forwardRef<MapComponentMethods, object>((props, ref) => {
    const { theme } = useTheme();
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );
    const [compostMarkers, setCompostMarkers] = useState<Compost[]>([]);
    const [toiletsMarkers, setToiletsMarkers] = useState<Toilet[]>([]);
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
        centerOnUserLocation: () => {
            if (location && mapRef.current) {
                const region: Region = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
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
                mapRef.current.animateToRegion(region, 500);
            }
        },
    }));

    useEffect(() => {
        const fetchCompostMarkers = async () => {
            try {
                const response = await axios.get(
                    "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/dechets-menagers-points-dapport-volontaire-composteurs/records?limit=30"
                );
                const compostData: Compost[] = response.data.results.map(
                    (record: any) => ({
                        operateur: record.operateur,
                        adresse: record.adresse,
                        geo_point_2d: {
                            lat: record.geo_point_2d?.lat ?? 0,
                            lon: record.geo_point_2d?.lon ?? 0,
                        },
                    })
                );
                setCompostMarkers(compostData);
            } catch (error) {
                console.error("Failed to fetch compost markers", error);
            }
        };

        const fetchToiletsMarkers = async () => {
            let toilets: Toilet[] = [];
            let page = 0;
            const limit = 100;

            try {
                while (true) {
                    const response = await axios.get(
                        `https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/sanisettesparis/records?limit=${limit}&offset=${page * limit
                        }`
                    );
                    const data = response.data.results as any[];

                    if (data.length === 0) break;

                    toilets = toilets.concat(
                        data.map((record) => ({
                            adresse: record.adresse || "Adresse non disponible",
                            geo_point_2d: record.geo_point_2d
                                ? {
                                    lat: record.geo_point_2d.lat ?? 0,
                                    lon: record.geo_point_2d.lon ?? 0,
                                }
                                : { lat: 0, lon: 0 },
                        }))
                    );
                    page++;
                }
                setToiletsMarkers(toilets);
            } catch (error) {
                console.error("Failed to fetch toilets markers", error);
            }
        };

        const initializeData = async () => {
            try {
                let { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.error("Location permission not granted");
                    return;
                }

                const userLocation = await Location.getCurrentPositionAsync({});
                setLocation(userLocation);

                await fetchCompostMarkers();
                await fetchToiletsMarkers();
            } catch (error) {
                console.error("Error during data initialization", error);
            }
        };

        initializeData();
    }, []);

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

    const getDistanceFromLatLonInKm = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    return (
        <View className={`flex-1 ${theme === "dark" ? "bg-black" : "bg-white"}`}>
            {location ? (
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation
                >
                    {compostMarkers.map((marker, index) => (
                        <Marker
                            key={`compost-${index}`}
                            coordinate={{
                                latitude: marker.geo_point_2d.lat,
                                longitude: marker.geo_point_2d.lon,
                            }}
                            title={marker.operateur || "Composteur"}
                            description={marker.adresse}
                        >
                            <Image
                                source={require("../assets/images/ping_composte.png")}
                                style={{ width: 40, height: 40 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    ))}
                    {toiletsMarkers.map((marker, index) => (
                        <Marker
                            key={`toilet-${index}`}
                            coordinate={{
                                latitude: marker.geo_point_2d.lat,
                                longitude: marker.geo_point_2d.lon,
                            }}
                            title="Toilette publique"
                            description={marker.adresse}
                        >
                            <Image
                                source={require("../assets/images/ping_toilet.png")}
                                style={{ width: 40, height: 40 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text
                        className={`text-lg ${theme === "dark" ? "text-white" : "text-black"
                            }`}
                    >
                        Chargement de la carte...
                    </Text>
                </View>
            )}
        </View>
    );
});

export default MapComponent;