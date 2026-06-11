/** Clé stable pour les marqueurs react-native-maps (évite les crashs iOS AIRMap). */
export function mapMarkerKey(prefix: string, lat: number, lon: number): string {
  return `${prefix}-${lat.toFixed(6)}-${lon.toFixed(6)}`;
}
