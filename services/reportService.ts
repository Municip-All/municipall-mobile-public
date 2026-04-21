import apiClient from './apiClient';

export interface Report {
  id?: number;
  category: string;
  description?: string;
  imageUrl?: string;
  lat: number;
  lon: number;
  status: string;
  createdAt?: string;
}

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    const response = await apiClient.get('reports');
    // Map the backend Point geometry back to flat lat/lon for the UI if needed
    return response.data.map((r: any) => ({
      ...r,
      lat: r.location?.coordinates[1] ?? 0,
      lon: r.location?.coordinates[0] ?? 0,
    }));
  },

  createReport: async (reportData: Partial<Report>): Promise<Report> => {
    const response = await apiClient.post('reports', reportData);
    return response.data;
  },
};
