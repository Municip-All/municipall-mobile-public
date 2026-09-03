import { memo } from 'react';
import { MAP_PIN_MARKER_IMAGES, type MapPinKind } from '../lib/map/pinImages';
import { Marker, type MapMarkerProps } from 'react-native-maps';
import type { ReportStatusDot } from '../lib/reportMapTypes';

export type { MapPinKind };

export type { ReportStatusDot };

const STATUS_LABELS: Record<ReportStatusDot, string> = {
  orange: 'En attente',
  blue: 'En cours',
  green: 'Résolu',
  gray: 'Archivé',
};

type MapPinMarkerProps = Omit<MapMarkerProps, 'image' | 'icon'> & {
  kind: MapPinKind;
  statusDot?: ReportStatusDot;
  badgeCount?: number;
};

/**
 * Bitmap natif via prop `image` (URI).
 * La taille affichée = dimensions du PNG (voir MAP_PIN_ASSET_MAX_PX dans constants).
 */
export default memo(function MapPinMarker({
  kind,
  statusDot,
  badgeCount,
  title,
  description,
  ...props
}: MapPinMarkerProps) {
  const imageUri = MAP_PIN_MARKER_IMAGES[kind];
  if (!imageUri) return null;

  const resolvedTitle =
    title ??
    (kind === 'report' && badgeCount != null && badgeCount > 1
      ? `${badgeCount} signalements`
      : undefined);

  const resolvedDescription =
    description ?? (statusDot ? STATUS_LABELS[statusDot] : undefined);

  return (
    <Marker
      {...props}
      image={imageUri}
      anchor={{ x: 0.5, y: 1 }}
      title={resolvedTitle}
      description={resolvedDescription}
    />
  );
});
