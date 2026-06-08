import apiClient from './apiClient';
import { prepareImageForUpload } from '../utils/avatarImage';

export interface ReportMessage {
  id: number;
  senderId: number;
  senderRole: 'citizen' | 'agent';
  senderName: string;
  body: string;
  createdAt: string;
}

export interface Report {
  id?: number;
  category: string;
  description?: string;
  imageUrl?: string;
  lat: number;
  lon: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: {
    body: string;
    senderRole: 'citizen' | 'agent';
    createdAt: string;
  };
}

export interface ReportDetail extends Report {
  id: number;
  messages: ReportMessage[];
}

function mapReport(r: Record<string, unknown>): Report {
  const location = r.location as { coordinates?: number[] } | undefined;
  return {
    id: typeof r.id === 'number' ? r.id : undefined,
    category: String(r.category ?? ''),
    description: typeof r.description === 'string' ? r.description : undefined,
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : undefined,
    lat: location?.coordinates?.[1] ?? Number(r.lat ?? 0),
    lon: location?.coordinates?.[0] ?? Number(r.lon ?? 0),
    status: String(r.status ?? 'En attente'),
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
    lastMessage:
      r.lastMessage && typeof r.lastMessage === 'object'
        ? (r.lastMessage as Report['lastMessage'])
        : undefined,
  };
}

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    const response = await apiClient.get('reports');
    return (response.data as Record<string, unknown>[]).map(mapReport);
  },

  getReport: async (id: number): Promise<ReportDetail> => {
    const response = await apiClient.get(`reports/${id}`);
    const data = response.data as Record<string, unknown>;
    const base = mapReport(data);
    const messages = Array.isArray(data.messages) ? (data.messages as ReportMessage[]) : [];
    return { ...base, id: Number(data.id), messages };
  },

  reply: async (id: number, body: string): Promise<ReportDetail> => {
    const response = await apiClient.post(`reports/${id}/messages`, { body });
    const data = response.data as Record<string, unknown>;
    const base = mapReport(data);
    const messages = Array.isArray(data.messages) ? (data.messages as ReportMessage[]) : [];
    return { ...base, id: Number(data.id), messages };
  },

  createReport: async (reportData: Partial<Report> & { userId?: number }): Promise<Report> => {
    const payload = { ...reportData };
    if (payload.imageUrl?.startsWith('file://')) {
      payload.imageUrl = await prepareImageForUpload(payload.imageUrl);
    }
    const response = await apiClient.post('reports', payload);
    return mapReport(response.data as Record<string, unknown>);
  },
};
