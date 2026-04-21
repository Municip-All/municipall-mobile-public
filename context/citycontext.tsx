import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Config } from '../constants/Config';
import { cityService, CityConfig } from '../services/cityService';

interface CityContextType {
  config: CityConfig | null;
  loading: boolean;
  tenantId: string;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<CityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const tenantId = Config.DEFAULT_TENANT_ID;

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

  const value = useMemo(() => ({ config, loading, tenantId }), [config, loading, tenantId]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within a CityProvider');
  return context;
};
