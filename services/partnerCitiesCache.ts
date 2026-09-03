import { cityService } from './cityService';

export type PartnerCityListItem = {
  id: string;
  name: string;
  officialName?: string;
  logoUrl?: string;
};

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedCities: PartnerCityListItem[] | null = null;
let cacheTimestamp = 0;
let inFlight: Promise<PartnerCityListItem[]> | null = null;

/** Liste des communes partenaires — une seule requête réseau partagée + cache court. */
export async function getPartnerCitiesCached(options?: {
  force?: boolean;
}): Promise<PartnerCityListItem[]> {
  const now = Date.now();
  if (
    !options?.force &&
    cachedCities &&
    now - cacheTimestamp < CACHE_TTL_MS
  ) {
    return cachedCities;
  }

  if (inFlight) return inFlight;

  inFlight = cityService
    .getAllCities()
    .then((cities) => {
      cachedCities = cities;
      cacheTimestamp = Date.now();
      return cities;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function peekPartnerCitiesCache(): PartnerCityListItem[] | null {
  if (!cachedCities) return null;
  if (Date.now() - cacheTimestamp >= CACHE_TTL_MS) return null;
  return cachedCities;
}

export function clearPartnerCitiesCache(): void {
  cachedCities = null;
  cacheTimestamp = 0;
  inFlight = null;
}
