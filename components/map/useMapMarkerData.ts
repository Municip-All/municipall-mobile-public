import { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';
import { distanceMeters } from '../../lib/geoDistance';
import {
  dominantReportStatusDot,
  groupReportsByLocation,
  type ReportLocationGroup,
} from '../../lib/groupReportsByLocation';
import {
  MAP_MARKER_MAX_RADIUS_M,
  MAX_COMPOST_MARKERS_VISIBLE,
  MAX_REPORT_MARKERS_VISIBLE,
  MAX_TOILET_MARKERS_VISIBLE,
  TRANSPORT_REFETCH_DEBOUNCE_MS,
  TRANSPORT_REFETCH_MIN_MOVE_M,
} from '../../lib/map/constants';
import { filterMarkersNear } from '../../lib/map/filterMarkersNear';
import { sameTransportStops } from '../../lib/map/transportStops';
import type { CompostMarker, ToiletMarker } from '../../lib/map/types';
import { fetchCompostMarkers, fetchPublicToilets } from '../../services/openDataService';
import { reportService } from '../../services/reportService';
import { transportService, type TransportStopMarker } from '../../services/transportService';

type MapCenter = { lat: number; lon: number };

type Options = {
  showReports: boolean;
  showTransports: boolean;
  mapLat?: number;
  mapLon?: number;
};

export function useMapMarkerData({ showReports, showTransports, mapLat, mapLon }: Options) {
  const { tenantId, config, loading: cityLoading } = useCity();
  const { isAuthenticated } = useAuth();
  const transportEnabled =
    (config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false;

  const [allCompostMarkers, setAllCompostMarkers] = useState<CompostMarker[]>([]);
  const [allToiletMarkers, setAllToiletMarkers] = useState<ToiletMarker[]>([]);
  const [citizenReports, setCitizenReports] = useState<
    Awaited<ReturnType<typeof reportService.getReports>>
  >([]);
  const [transportMarkers, setTransportMarkers] = useState<TransportStopMarker[]>([]);
  const [transportZoneCenter, setTransportZoneCenter] = useState<MapCenter | null>(null);

  const transportFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transportAbortRef = useRef<AbortController | null>(null);
  const transportRequestIdRef = useRef(0);
  const lastTransportFetchCenterRef = useRef<MapCenter | null>(null);
  const transportLoadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [composts, toilets] = await Promise.all([
          fetchCompostMarkers(),
          fetchPublicToilets(),
        ]);
        if (!cancelled) {
          setAllCompostMarkers(composts);
          setAllToiletMarkers(toilets);
        }
      } catch {
        if (!cancelled) {
          setAllCompostMarkers([]);
          setAllToiletMarkers([]);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !showReports) {
      setCitizenReports([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const reports = await reportService.getReports();
        if (!cancelled) setCitizenReports(reports);
      } catch {
        if (!cancelled) setCitizenReports([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, showReports]);

  const abortTransportFetch = useCallback(() => {
    transportAbortRef.current?.abort();
    transportAbortRef.current = null;
  }, []);

  const loadTransportMarkers = useCallback(
    async (center: MapCenter, force = false) => {
      if (!showTransports || !transportEnabled || !tenantId) return;

      const last = lastTransportFetchCenterRef.current;
      if (
        !force &&
        last &&
        distanceMeters(last.lat, last.lon, center.lat, center.lon) < TRANSPORT_REFETCH_MIN_MOVE_M
      ) {
        return;
      }

      if (transportLoadingRef.current && !force) return;

      abortTransportFetch();
      const controller = new AbortController();
      transportAbortRef.current = controller;
      const requestId = ++transportRequestIdRef.current;
      transportLoadingRef.current = true;

      try {
        const data = await transportService.getDisruptions(tenantId, center.lat, center.lon, {
          signal: controller.signal,
        });
        if (requestId !== transportRequestIdRef.current) return;

        const nextStops = data.stops ?? [];
        lastTransportFetchCenterRef.current = center;

        setTransportMarkers((prev) => (sameTransportStops(prev, nextStops) ? prev : nextStops));
        setTransportZoneCenter((prev) => {
          if (!prev) return center;
          if (
            distanceMeters(prev.lat, prev.lon, center.lat, center.lon) <
            TRANSPORT_REFETCH_MIN_MOVE_M
          ) {
            return prev;
          }
          return center;
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        if (isAxiosError(error) && error.code === 'ERR_CANCELED') return;
      } finally {
        if (requestId === transportRequestIdRef.current) {
          transportLoadingRef.current = false;
        }
      }
    },
    [abortTransportFetch, showTransports, tenantId, transportEnabled]
  );

  useEffect(() => {
    if (cityLoading) return;

    if (!showTransports || !transportEnabled || !tenantId || mapLat == null || mapLon == null) {
      abortTransportFetch();
      lastTransportFetchCenterRef.current = null;
      setTransportMarkers([]);
      setTransportZoneCenter(null);
      return;
    }

    void loadTransportMarkers({ lat: mapLat, lon: mapLon }, true);
  }, [
    abortTransportFetch,
    cityLoading,
    loadTransportMarkers,
    mapLat,
    mapLon,
    showTransports,
    tenantId,
    transportEnabled,
  ]);

  useEffect(
    () => () => {
      if (transportFetchTimerRef.current) clearTimeout(transportFetchTimerRef.current);
      abortTransportFetch();
    },
    [abortTransportFetch]
  );

  const scheduleTransportZoneUpdate = useCallback(
    (center: MapCenter) => {
      if (!showTransports || !transportEnabled) return;
      if (transportFetchTimerRef.current) clearTimeout(transportFetchTimerRef.current);
      transportFetchTimerRef.current = setTimeout(() => {
        void loadTransportMarkers(center);
      }, TRANSPORT_REFETCH_DEBOUNCE_MS);
    },
    [loadTransportMarkers, showTransports, transportEnabled]
  );

  const reportGroups = useMemo(() => groupReportsByLocation(citizenReports), [citizenReports]);

  const compostMarkers = useMemo(() => {
    if (mapLat == null || mapLon == null) return [];
    return filterMarkersNear(
      allCompostMarkers,
      (m) => ({ lat: m.geo_point_2d.lat, lon: m.geo_point_2d.lon }),
      mapLat,
      mapLon,
      MAP_MARKER_MAX_RADIUS_M,
      MAX_COMPOST_MARKERS_VISIBLE,
    );
  }, [allCompostMarkers, mapLat, mapLon]);

  const toiletMarkers = useMemo(() => {
    if (mapLat == null || mapLon == null) return [];
    return filterMarkersNear(
      allToiletMarkers,
      (m) => ({ lat: m.geo_point_2d.lat, lon: m.geo_point_2d.lon }),
      mapLat,
      mapLon,
      MAP_MARKER_MAX_RADIUS_M,
      MAX_TOILET_MARKERS_VISIBLE,
    );
  }, [allToiletMarkers, mapLat, mapLon]);

  const visibleReportGroups = useMemo(() => {
    if (mapLat == null || mapLon == null) return reportGroups;
    return filterMarkersNear(
      reportGroups,
      (g) => ({ lat: g.lat, lon: g.lon }),
      mapLat,
      mapLon,
      MAP_MARKER_MAX_RADIUS_M,
      MAX_REPORT_MARKERS_VISIBLE,
    );
  }, [mapLat, mapLon, reportGroups]);

  const transportZoneHasDisruption = transportMarkers.some((m) => m.status === 'disrupted');

  return {
    compostMarkers,
    toiletMarkers,
    reportGroups: visibleReportGroups,
    transportMarkers,
    transportZoneCenter,
    transportZoneHasDisruption,
    transportEnabled,
    scheduleTransportZoneUpdate,
    dominantReportStatusDot,
  };
}

export type { ReportLocationGroup, TransportStopMarker };
