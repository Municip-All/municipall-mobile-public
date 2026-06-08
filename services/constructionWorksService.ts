import apiClient from './apiClient';

export interface ConstructionWork {
  id: number;
  title: string;
  description?: string;
  locationName: string;
  startDate: string;
  endDate: string;
  status: string;
  impactType?: string;
  updatedAt?: string;
}

export const constructionWorksService = {
  getWorks: async (): Promise<ConstructionWork[]> => {
    const response = await apiClient.get<ConstructionWork[]>('construction-works');
    return response.data ?? [];
  },
};
