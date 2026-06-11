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
import type { CompostMarker, ToiletMarker } from '../../lib/map/types';
import { fetchCompostMarkers, fetchPublicToilets } from '../../services/openDataService';
import { reportService } from '../../services/reportService';
import {
  transportService,
  type TransportStopMarker,
} from '../../services/transportService';

const TRANSPORT_REFETCH_DEBOUNCE_MS = 1200;
const TRANSPORT_REFETCH_MIN_MOVE_M = 600;

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

  const [compostMarkers, setCompostMarkers] = useState<CompostMarker[]>([]);
  const [toiletMarkers, setToiletMarkers] = useState<ToiletMarker[]>([]);
  const [citizenReports, setCitizenReports] = useState<Awaited<
    ReturnType<typeof reportService.getReports>
  >>([]);
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
          setCompostMarkers(composts);
          setToiletMarkers(toilets);
        }
      } catch (error) {
        console.error('useMapMarkerData: open data fetch failed', error);
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
      } catch (error) {
        console.error('useMapMarkerData: reports fetch failed', error);
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

        lastTransportFetchCenterRef.current = center;
        setTransportZoneCenter(center);
        setTransportMarkers(data.stops ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (isAxiosError(error) && error.code === 'ERR_CANCELED') return;
        console.error('useMapMarkerData: transport fetch failed', error);
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

    if (
      !showTransports ||
      !transportEnabled ||
      !tenantId ||
      mapLat == null ||
      mapLon == null
    ) {
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

  const reportGroups = useMemo(
    () => groupReportsByLocation(citizenReports),
    [citizenReports]
  );

  const transportZoneHasDisruption = transportMarkers.some((m) => m.status === 'disrupted');

  return {
    compostMarkers,
    toiletMarkers,
    reportGroups,
    transportMarkers,
    transportZoneCenter,
    transportZoneHasDisruption,
    transportEnabled,
    scheduleTransportZoneUpdate,
    dominantReportStatusDot,
  };
}

export type { ReportLocationGroup, TransportStopMarker };
