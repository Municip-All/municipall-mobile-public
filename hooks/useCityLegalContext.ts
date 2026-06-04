import { useEffect, useState } from 'react';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';
import { cityService } from '../services/cityService';
import type { CityLegalContext } from '../constants/legalContent';

/**
 * Contexte légal lié à la commune de l'utilisateur (durées de conservation contractuelles).
 */
export function useCityLegalContext(): CityLegalContext & { loading: boolean } {
  const { user } = useAuth();
  const { config, tenantId } = useCity();
  const [ctx, setCtx] = useState<CityLegalContext>({
    cityName: config?.name,
    dataRetentionPolicy: config?.dataRetentionPolicy,
  });
  const [loading, setLoading] = useState(false);

  const cityId = user?.cityId || tenantId;

  useEffect(() => {
    if (!cityId) {
      setCtx({ cityName: config?.name, dataRetentionPolicy: config?.dataRetentionPolicy });
      return;
    }

    let cancelled = false;
    setLoading(true);

    cityService
      .getCityConfig(cityId)
      .then((cfg) => {
        if (cancelled) return;
        setCtx({
          cityName: cfg.name,
          dataRetentionPolicy: cfg.dataRetentionPolicy,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setCtx({
          cityName: config?.name,
          dataRetentionPolicy: config?.dataRetentionPolicy,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityId, config?.name, config?.dataRetentionPolicy]);

  return { ...ctx, loading };
}
