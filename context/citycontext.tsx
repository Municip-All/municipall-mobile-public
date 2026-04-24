import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Config } from '../constants/Config';
import { cityService, CityConfig } from '../services/cityService';
import * as Location from 'expo-location';
import apiClient from '../services/apiClient';

interface CityContextType {
  config: CityConfig | null;
  loading: boolean;
  tenantId: string;
  weatherData: any | null;
  weatherLoading: boolean;
  fetchWeather: () => Promise<void>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<CityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [tenantId, setTenantId] = useState(Config.DEFAULT_TENANT_ID);

  const fetchWeather = useCallback(async () => {
    if (!config?.features?.includes('weather')) return;

    setWeatherLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const response = await apiClient.get('/weather', {
        params: {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        },
      });
      setWeatherData(response.data);
    } catch (error) {
      console.error('CityContext: Error fetching weather:', error);
    } finally {
      setWeatherLoading(false);
    }
  }, [config?.features]);

  useEffect(() => {
    if (config?.features?.includes('weather')) {
      fetchWeather();
    }
  }, [config?.features, fetchWeather]);

  useEffect(() => {
    const initializeCity = async () => {
      setLoading(true);
      try {
        // 1. Get GPS Location
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          // 2. Try to detect city via Backend PostGIS
          const detectedCity = await cityService.detectCity(
            location.coords.latitude,
            location.coords.longitude
          );

          if (detectedCity && detectedCity.id) {
            console.log(`CityContext: Detected city ${detectedCity.name} (${detectedCity.id})`);
            setTenantId(detectedCity.id);
            setConfig(detectedCity);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log('CityContext: Automatic detection failed, using fallback.', error);
      }

      // 3. Fallback to default city if detection fails or permission denied
      try {
        const fallbackConfig = await cityService.getCityConfig(Config.DEFAULT_TENANT_ID);
        setConfig(fallbackConfig);
      } catch (error) {
        console.error('CityContext: Failed to fetch fallback config', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCity();
  }, []);

  const value = useMemo(
    () => ({
      config,
      loading,
      tenantId,
      weatherData,
      weatherLoading,
      fetchWeather,
    }),
    [config, loading, tenantId, weatherData, weatherLoading, fetchWeather]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within a CityProvider');
  return context;
};
