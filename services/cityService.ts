import apiClient from './apiClient';

export interface CityContactConfig {
  email?: string;
  phone?: string;
  helpText?: string;
}

export interface CityConfig {
  id?: string;
  name: string;
  officialName?: string;
  features: string[];
  dataRetentionPolicy?: string;
  contact?: CityContactConfig;
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    backgroundColorLight?: string;
    backgroundColorDark?: string;
    useGradient: boolean;
    logoUrl: string;
  };
  wasteConfig?: {
    services: {
      type: string;
      icon: string;
      color: string;
      days: number[];
      time: string;
    }[];
  };
  isTransportFeatureAllowed?: boolean;
  isTransportFeatureEnabled?: boolean;
}

export const cityService = {
  getCityConfig: async (cityId: string): Promise<CityConfig> => {
    const response = await apiClient.get(`city-config/${cityId}`);
    return response.data;
  },

  detectCity: async (lat: number, lon: number): Promise<CityConfig> => {
    const response = await apiClient.get(`city-config/detect`, {
      params: { lat, lon },
    });
    return response.data;
  },

  getAllCities: async (): Promise<
    { id: string; name: string; officialName?: string; logoUrl?: string }[]
  > => {
    const response = await apiClient.get(`city-config`);
    return response.data;
  },
};
