import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Config } from '../constants/Config';
import { cityService, CityConfig } from '../services/cityService';
import * as Location from 'expo-location';
import { isAxiosError } from 'axios';
import apiClient, { setApiTenantId } from '../services/apiClient';

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

interface CityContextType {
  config: CityConfig | null;
  loading: boolean;
  tenantId: string;
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
  fetchWeather: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  /** Recharge config + tenant (marque blanche après login ou changement de ville) */
  applyBrandingCity: (cityId: string) => Promise<void>;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<CityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [tenantId, setTenantIdState] = useState(Config.DEFAULT_TENANT_ID);

  const setTenantId = useCallback((id: string) => {
    setTenantIdState(id);
    setApiTenantId(id);
  }, []);

  const refreshConfig = useCallback(async () => {
    if (!tenantId) return;
    try {
      const cfg = await cityService.getCityConfig(tenantId);
      setConfig(cfg);
    } catch (error) {
      console.error('CityContext: Failed to refresh config', error);
    }
  }, [tenantId]);

  const applyBrandingCity = useCallback(
    async (cityId: string) => {
      if (!cityId) return;
      try {
        const cfg = await cityService.getCityConfig(cityId);
        setTenantId(cityId);
        setConfig(cfg);
      } catch (error) {
        console.error('CityContext: Failed to apply branding city', error);
      }
    },
    [setTenantId]
  );

  const fetchWeather = useCallback(async () => {
    if (!config?.features?.includes('weather')) {
      setWeatherError('Module météo désactivé pour cette ville.');
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeatherError('Autorisez la localisation pour afficher la météo.');
        setWeatherData(null);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const response = await apiClient.get<WeatherData>('weather', {
        params: {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        },
      });
      setWeatherData(response.data);
    } catch (error: unknown) {
      console.error('CityContext: Error fetching weather:', error);
      setWeatherData(null);
      let message = 'Impossible de récupérer la météo. Réessayez.';
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string | string[] } | undefined;
        if (typeof data?.message === 'string') message = data.message;
        else if (Array.isArray(data?.message)) message = data.message.join(', ');
      }
      setWeatherError(message);
    } finally {
      setWeatherLoading(false);
    }
  }, [config?.features]);

  useEffect(() => {
    if (config?.features?.includes('weather')) {
      fetchWeather();
    } else {
      setWeatherData(null);
      setWeatherError(null);
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
        setTenantId(Config.DEFAULT_TENANT_ID);
        setConfig(fallbackConfig);
      } catch (error) {
        console.error('CityContext: Failed to fetch fallback config', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCity();
  }, [setTenantId]);

  const value = useMemo(
    () => ({
      config,
      loading,
      tenantId,
      weatherData,
      weatherLoading,
      weatherError,
      fetchWeather,
      refreshConfig,
      applyBrandingCity,
    }),
    [
      config,
      loading,
      tenantId,
      weatherData,
      weatherLoading,
      weatherError,
      fetchWeather,
      refreshConfig,
      applyBrandingCity,
    ]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within a CityProvider');
  return context;
};
