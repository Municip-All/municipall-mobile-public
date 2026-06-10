import apiClient from './apiClient';

/** Rayon de recherche IDFM (m) — aligné sur le backend */
export const TRANSPORT_SEARCH_RADIUS_M = 1200;

export type TransportMode = 'metro' | 'rer' | 'train' | 'tram' | 'bus' | 'other';
export type TransportDisruptionStatus = 'normal' | 'disrupted';

export interface TransportLineDisruption {
  lineId: string;
  lineName: string;
  mode: TransportMode;
  status: TransportDisruptionStatus;
  messages: string[];
}

export interface TransportStopMarker {
  stopId: string;
  name: string;
  lat: number;
  lon: number;
  modes: string[];
  status: TransportDisruptionStatus;
  messages: string[];
}

export interface TransportDisruptionsResponse {
  lines: TransportLineDisruption[];
  stops: TransportStopMarker[];
  fetchedAt: string;
}

export type TransportFetchOptions = {
  signal?: AbortSignal;
};

export const transportService = {
  getDisruptions: async (
    cityId: string,
    lat: number,
    lon: number,
    options?: TransportFetchOptions
  ): Promise<TransportDisruptionsResponse> => {
    const response = await apiClient.get(
      `municipalities/${encodeURIComponent(cityId)}/transports/disruptions`,
      {
        params: { lat, lon },
        timeout: 30000,
        signal: options?.signal,
      }
    );
    return response.data;
  },
};
