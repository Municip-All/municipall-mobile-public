import { useEffect, useState } from 'react';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';
import {
  getPartnerCitiesCached,
  peekPartnerCitiesCache,
  type PartnerCityListItem,
} from '../services/partnerCitiesCache';
import { canAccessCityServices, hasPartnerResidence } from '../lib/cityServicesAccess';
import { partnerCityName } from '../lib/partnerCities';

export function useCityServicesAccess() {
  const { user, isAuthenticated } = useAuth();
  const { tenantId } = useCity();
  const [partnerCities, setPartnerCities] = useState<PartnerCityListItem[]>(
    () => peekPartnerCitiesCache() ?? []
  );

  useEffect(() => {
    let cancelled = false;
    getPartnerCitiesCached()
      .then((cities) => {
        if (!cancelled) setPartnerCities(cities);
      })
      .catch(() => {
        // Ne pas vider la liste : garder le cache ou [] pour le repli tenant/profile.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const residenceIsPartner = hasPartnerResidence(user?.cityId, tenantId, partnerCities);

  const cityServicesEnabled = canAccessCityServices(
    isAuthenticated,
    user?.cityId,
    tenantId,
    partnerCities
  );

  const residenceCityName = partnerCityName(user?.cityId, partnerCities);

  return {
    cityServicesEnabled,
    hasPartnerResidence: isAuthenticated && residenceIsPartner,
    partnerCities,
    residenceCityName,
    isGuest: !isAuthenticated,
    needsPartnerCity: isAuthenticated && !residenceIsPartner,
  };
}
