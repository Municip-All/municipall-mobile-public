import apiClient from './apiClient';

export interface CityConfig {
  name: string;
  features: string[];
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    useGradient: boolean;
    logoUrl: string;
  };
}

export const cityService = {
  getCityConfig: async (cityId: string): Promise<CityConfig> => {
    const response = await apiClient.get(`city-config/${cityId}`);
    return response.data;
  },
};
