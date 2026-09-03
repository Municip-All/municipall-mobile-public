import { distanceMeters } from '../geoDistance';

/** Filtre les marqueurs proches du centre visible (limite charge AIRMap). */
export function filterMarkersNear<T>(
  markers: T[],
  getLatLon: (marker: T) => { lat: number; lon: number },
  centerLat: number,
  centerLon: number,
  maxRadiusM: number,
  maxCount: number,
): T[] {
  if (markers.length === 0) return [];

  return markers
    .map((marker) => {
      const { lat, lon } = getLatLon(marker);
      return { marker, distance: distanceMeters(centerLat, centerLon, lat, lon) };
    })
    .filter((entry) => entry.distance <= maxRadiusM)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxCount)
    .map((entry) => entry.marker);
}
