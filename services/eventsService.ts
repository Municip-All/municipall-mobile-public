import apiClient from './apiClient';

export interface CityEvent {
  id: number;
  cityId: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const eventsService = {
  getEvents: async (): Promise<CityEvent[]> => {
    const response = await apiClient.get<CityEvent[]>('events');
    return response.data ?? [];
  },
};
