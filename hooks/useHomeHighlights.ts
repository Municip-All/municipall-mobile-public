import { useCallback, useEffect, useRef, useState } from 'react';
import { CityConfig } from '../services/cityService';
import { eventsService } from '../services/eventsService';
import { constructionWorksService } from '../services/constructionWorksService';
import { buildHomeHighlights, HomeHighlight } from '../services/homeHighlights';

function configCacheKey(config: CityConfig | null): string {
  if (!config) return '';
  return [
    config.features?.join(',') ?? '',
    JSON.stringify(config.wasteConfig?.services ?? []),
  ].join('|');
}

export function useHomeHighlights(config: CityConfig | null) {
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [loading, setLoading] = useState(false);
  const configRef = useRef(config);
  configRef.current = config;
  const inFlightRef = useRef(false);
  const fetchedKeyRef = useRef('');

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const cfg = configRef.current;
    if (!cfg) {
      setHighlights([]);
      setLoading(false);
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);

    try {
      const [works, events] = await Promise.all([
        constructionWorksService.getWorks().catch(() => []),
        cfg.features?.includes('agenda')
          ? eventsService.getEvents().catch(() => [])
          : Promise.resolve([]),
      ]);
      setHighlights(buildHomeHighlights(cfg, works, events));
    } catch (e) {
      console.error('useHomeHighlights:', e);
      setHighlights(buildHomeHighlights(cfg, [], []));
    } finally {
      inFlightRef.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  const cacheKey = configCacheKey(config);

  useEffect(() => {
    if (!cacheKey) return;
    if (cacheKey === fetchedKeyRef.current) return;
    fetchedKeyRef.current = cacheKey;
    refresh({ silent: false });
  }, [cacheKey, refresh]);

  const refreshIfStale = useCallback(() => {
    if (!cacheKey) return;
    refresh({ silent: true });
  }, [cacheKey, refresh]);

  return { highlights, loading, refresh: refreshIfStale };
}
