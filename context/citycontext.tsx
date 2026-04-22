import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  const tenantId = Config.DEFAULT_TENANT_ID;

  const fetchWeather = async () => {
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
  };

  useEffect(() => {
    if (config?.features?.includes('weather')) {
      fetchWeather();
    }
  }, [config]);

  useEffect(() => {
    const fetchCityConfig = async () => {
      try {
        const data = await cityService.getCityConfig(tenantId);
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch city config from backend', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityConfig();
  }, [tenantId]);

  const value = useMemo(() => ({ 
    config, 
    loading, 
    tenantId, 
    weatherData, 
    weatherLoading,
    fetchWeather 
  }), [config, loading, tenantId, weatherData, weatherLoading]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within a CityProvider');
  return context;
};
