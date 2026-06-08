import * as Location from 'expo-location';

export class LocationPermissionError extends Error {
  constructor() {
    super('LOCATION_DENIED');
    this.name = 'LocationPermissionError';
  }
}

async function formatAddressFromCoords(lat: number, lon: number): Promise<string> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const place = places[0];
    if (!place) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    const street = [place.streetNumber, place.street].filter(Boolean).join(' ');
    const parts = [street, place.postalCode, place.city || place.subregion || place.region].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

export type ReportCoords = {
  lat: number;
  lon: number;
  addressLabel: string;
};

/** Demande la permission GPS, récupère la position et un libellé d'adresse. */
export async function getReportLocation(): Promise<ReportCoords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationPermissionError();
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const addressLabel = await formatAddressFromCoords(lat, lon);

  return { lat, lon, addressLabel };
}
