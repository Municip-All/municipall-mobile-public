export type GeoPoint = { lat: number; lon: number };

export type CompostMarker = {
  id: string;
  operateur?: string;
  adresse?: string;
  geo_point_2d: GeoPoint;
};

export type ToiletMarker = {
  id: string;
  adresse?: string;
  geo_point_2d: GeoPoint;
};

export type MapLayers = {
  composts: boolean;
  toilets: boolean;
  reports: boolean;
  transports: boolean;
};

export type MapCenter = {
  lat: number;
  lon: number;
};

export type CityMapMethods = {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnUserLocation: () => void;
};
