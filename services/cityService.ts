import apiClient from './apiClient';

export interface CityConfig {
  id?: string;
  name: string;
  features: string[];
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    useGradient: boolean;
    logoUrl: string;
  };
  neighborhoods?: string[];
  usefulNumbers?: { label: string; phone: string; icon: string }[];
  usefulLinks?: { label: string; url: string; icon: string }[];
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
};
