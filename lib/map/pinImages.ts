import resolveAssetSource from 'expo-asset/build/resolveAssetSource';
import type { ImageSourcePropType } from 'react-native';

export type MapPinKind = 'composte' | 'toilet' | 'report' | 'transport';

/**
 * PNG dans assets/map/ — max ~120 px (voir MAP_PIN_ASSET_MAX_PX).
 * react-native-maps affiche la taille pixel native ; le style React ne scale pas l'image.
 */
export const MAP_PIN_ASSETS = {
  composte: require('../../assets/map/ping_composte.png'),
  toilet: require('../../assets/map/ping_toilet.png'),
  report: require('../../assets/map/ping_reports.png'),
  transport: require('../../assets/map/ping_transports.png'),
} as const satisfies Record<MapPinKind, ImageSourcePropType>;

function toMarkerImageUri(asset: ImageSourcePropType): string {
  const resolved = resolveAssetSource(asset);
  if (resolved && typeof resolved === 'object' && 'uri' in resolved && resolved.uri) {
    return resolved.uri;
  }
  return '';
}

/** URIs résolues pour la prop native `image` du Marker (pas de vues React enfant). */
export const MAP_PIN_MARKER_IMAGES: Record<MapPinKind, string> = {
  composte: toMarkerImageUri(MAP_PIN_ASSETS.composte),
  toilet: toMarkerImageUri(MAP_PIN_ASSETS.toilet),
  report: toMarkerImageUri(MAP_PIN_ASSETS.report),
  transport: toMarkerImageUri(MAP_PIN_ASSETS.transport),
};
