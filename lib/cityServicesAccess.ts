import { Alert } from 'react-native';
import { isPartnerCity } from './partnerCities';
import { openReferCityEmail } from './referCity';

type RouterLike = { push: (href: string) => void; replace?: (href: string) => void };

const PLATFORM_TENANT_ID = 'platform';

/** Résidence partenaire : liste API ou repli si la liste est indisponible (429, réseau). */
export function hasPartnerResidence(
  userCityId: string | undefined | null,
  tenantId: string,
  partnerCities: { id: string }[]
): boolean {
  if (!userCityId) return false;
  if (isPartnerCity(userCityId, partnerCities)) return true;
  // Liste vide / erreur API : on fie le profil + tenant aligné (pas le tenant générique).
  if (
    partnerCities.length === 0 &&
    tenantId === userCityId &&
    tenantId !== PLATFORM_TENANT_ID
  ) {
    return true;
  }
  return false;
}

export function canAccessCityServices(
  isAuthenticated: boolean,
  userCityId: string | undefined | null,
  tenantId: string,
  partnerCities: { id: string }[]
): boolean {
  if (!isAuthenticated) return true;
  if (!hasPartnerResidence(userCityId, tenantId, partnerCities)) return false;
  return userCityId === tenantId;
}

export function promptNoPartnerCity(): void {
  Alert.alert(
    'Commune non partenaire',
    "Les services municipaux (signalements, contact mairie, collecte, etc.) sont disponibles uniquement pour les communes partenaires Municip'All. Vous pouvez suggérer la solution à votre maire.",
    [
      { text: 'Plus tard', style: 'cancel' },
      { text: 'Inviter ma mairie', onPress: openReferCityEmail },
    ]
  );
}

export function ensureAuthenticatedForReport(
  isAuthenticated: boolean,
  router: RouterLike
): boolean {
  if (isAuthenticated) return true;
  Alert.alert('Connexion requise', 'Un compte est nécessaire pour envoyer un signalement.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Se connecter', onPress: () => router.push('/login') },
  ]);
  return false;
}

export function ensureCanReport(
  isAuthenticated: boolean,
  cityServicesEnabled: boolean,
  router: RouterLike
): boolean {
  if (!ensureAuthenticatedForReport(isAuthenticated, router)) return false;
  if (!cityServicesEnabled) {
    promptNoPartnerCity();
    return false;
  }
  return true;
}

export function ensureCityServices(
  cityServicesEnabled: boolean,
  options?: { message?: string }
): boolean {
  if (cityServicesEnabled) return true;
  const message =
    options?.message ??
    "Cette fonctionnalité est disponible lorsque votre commune de résidence est partenaire Municip'All.";
  Alert.alert('Commune non partenaire', message, [
    { text: 'Plus tard', style: 'cancel' },
    { text: 'Inviter ma mairie', onPress: openReferCityEmail },
  ]);
  return false;
}
