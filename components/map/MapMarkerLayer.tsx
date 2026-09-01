import MapPinMarker from '@components/MapPinMarker';
import { Circle } from 'react-native-maps';
import { palette, tintColor } from '@constants/design';
import { TRANSPORT_SEARCH_RADIUS_M } from '../../services/transportService';
import type { CompostMarker, ToiletMarker } from '../../lib/map/types';
import type { ReportLocationGroup } from '../../lib/groupReportsByLocation';
import type { ReportStatusDot } from '../../lib/reportMapTypes';
import type { TransportStopMarker } from '../../services/transportService';

const MAP_OVERLAYS_ENABLED = true;

type Props = {
  showComposts: boolean;
  showToilets: boolean;
  showReports: boolean;
  showTransports: boolean;
  transportEnabled: boolean;
  compostMarkers: CompostMarker[];
  toiletMarkers: ToiletMarker[];
  reportGroups: ReportLocationGroup[];
  transportMarkers: TransportStopMarker[];
  transportZoneCenter: { lat: number; lon: number } | null;
  transportZoneHasDisruption: boolean;
  getReportStatusDot: (reports: ReportLocationGroup['reports']) => ReportStatusDot;
  onReportGroupPress?: (group: ReportLocationGroup) => void;
  onTransportStopPress?: (stop: TransportStopMarker) => void;
};

export default function MapMarkerLayer({
  showComposts,
  showToilets,
  showReports,
  showTransports,
  transportEnabled,
  compostMarkers,
  toiletMarkers,
  reportGroups,
  transportMarkers,
  transportZoneCenter,
  transportZoneHasDisruption,
  getReportStatusDot,
  onReportGroupPress,
  onTransportStopPress,
}: Props) {
  if (!MAP_OVERLAYS_ENABLED) {
    return null;
  }

  return (
    <>
      {showTransports && transportEnabled && transportZoneCenter ? (
        <Circle
          center={{
            latitude: transportZoneCenter.lat,
            longitude: transportZoneCenter.lon,
          }}
          radius={TRANSPORT_SEARCH_RADIUS_M}
          strokeColor={
            transportZoneHasDisruption
              ? tintColor(palette.amber400, 'D9')
              : tintColor(palette.info400, 'BF')
          }
          fillColor={
            transportZoneHasDisruption
              ? tintColor(palette.amber400, '1F')
              : tintColor(palette.info400, '1A')
          }
          strokeWidth={2}
        />
      ) : null}

      {showComposts
        ? compostMarkers.map((marker) => (
            <MapPinMarker
              key={marker.id}
              kind='composte'
              coordinate={{
                latitude: marker.geo_point_2d.lat,
                longitude: marker.geo_point_2d.lon,
              }}
              title={marker.operateur || 'Composteur'}
              description={marker.adresse}
            />
          ))
        : null}

      {showToilets
        ? toiletMarkers.map((marker) => (
            <MapPinMarker
              key={marker.id}
              kind='toilet'
              coordinate={{
                latitude: marker.geo_point_2d.lat,
                longitude: marker.geo_point_2d.lon,
              }}
              title='Toilette publique'
              description={marker.adresse}
            />
          ))
        : null}

      {showReports
        ? reportGroups.map((group) => (
            <MapPinMarker
              key={group.key}
              kind='report'
              statusDot={getReportStatusDot(group.reports)}
              badgeCount={group.reports.length}
              coordinate={{
                latitude: group.lat,
                longitude: group.lon,
              }}
              onPress={() => onReportGroupPress?.(group)}
            />
          ))
        : null}

      {showTransports && transportEnabled
        ? transportMarkers.map((marker) => (
            <MapPinMarker
              key={`transport-${marker.stopId}`}
              kind='transport'
              statusDot={marker.status === 'disrupted' ? 'orange' : undefined}
              coordinate={{
                latitude: marker.lat,
                longitude: marker.lon,
              }}
              onPress={() => onTransportStopPress?.(marker)}
            />
          ))
        : null}
    </>
  );
}
