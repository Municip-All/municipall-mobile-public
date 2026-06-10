export interface CityListItem {
  id: string;
  name: string;
  officialName?: string;
  logoUrl?: string;
}

/** Nom affiché à l'utilisateur : commune officielle, pas le nom d'app (marque blanche). */
export function cityDisplayName(city: { name: string; officialName?: string }): string {
  const official = city.officialName?.trim();
  return official || city.name;
}

export function cityNameById(
  cityId: string | undefined | null,
  cities: CityListItem[]
): string | undefined {
  if (!cityId) return undefined;
  const city = cities.find((c) => c.id === cityId);
  return city ? cityDisplayName(city) : undefined;
}
