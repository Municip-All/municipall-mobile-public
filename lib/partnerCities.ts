import { cityNameById, type CityListItem } from './cityDisplay';

/** Une commune est « partenaire » si son identifiant figure dans la liste Municipall. */
export function isPartnerCity(
  cityId: string | undefined | null,
  partnerCities: { id: string }[]
): boolean {
  if (!cityId) return false;
  return partnerCities.some((city) => city.id === cityId);
}

export function partnerCityName(
  cityId: string | undefined | null,
  partnerCities: CityListItem[]
): string | undefined {
  return cityNameById(cityId, partnerCities);
}
