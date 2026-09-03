import type { TransportStopMarker } from '../../services/transportService';

export function transportStopIdsKey(stops: TransportStopMarker[]): string {
  return stops
    .map((s) => s.stopId)
    .sort()
    .join('|');
}

export function sameTransportStops(a: TransportStopMarker[], b: TransportStopMarker[]): boolean {
  return transportStopIdsKey(a) === transportStopIdsKey(b);
}
