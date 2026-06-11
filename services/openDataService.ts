import axios from 'axios';
import type { CompostMarker, ToiletMarker } from '../lib/map/types';

const PARIS_API = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets';

type ParisRecord = {
  operateur?: string;
  adresse?: string;
  geo_point_2d?: { lat?: number; lon?: number };
};

export async function fetchCompostMarkers(limit = 30): Promise<CompostMarker[]> {
  const response = await axios.get<{ results: ParisRecord[] }>(
    `${PARIS_API}/dechets-menagers-points-dapport-volontaire-composteurs/records`,
    { params: { limit } }
  );

  const markers: CompostMarker[] = [];

  response.data.results.forEach((record, index) => {
    const lat = record.geo_point_2d?.lat;
    const lon = record.geo_point_2d?.lon;
    if (lat == null || lon == null) return;

    markers.push({
      id: `compost-${lat}-${lon}-${index}`,
      operateur: record.operateur,
      adresse: record.adresse,
      geo_point_2d: { lat, lon },
    });
  });

  return markers;
}

export async function fetchPublicToilets(limit = 50): Promise<ToiletMarker[]> {
  const response = await axios.get<{ results: ParisRecord[] }>(
    `${PARIS_API}/sanisettesparis/records`,
    { params: { limit } }
  );

  const markers: ToiletMarker[] = [];

  response.data.results.forEach((record, index) => {
    const lat = record.geo_point_2d?.lat;
    const lon = record.geo_point_2d?.lon;
    if (lat == null || lon == null) return;

    markers.push({
      id: `toilet-${lat}-${lon}-${index}`,
      adresse: record.adresse || 'Adresse non disponible',
      geo_point_2d: { lat, lon },
    });
  });

  return markers;
}
