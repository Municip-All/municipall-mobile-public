import { Alert } from 'react-native';

type RouterLike = { push: (href: string) => void; replace?: (href: string) => void };

export function promptLoginForReport(router: RouterLike): void {
  Alert.alert('Connexion requise', 'Un compte est nécessaire pour envoyer un signalement.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Se connecter', onPress: () => router.push('/login') },
  ]);
}

export function ensureAuthenticatedForReport(
  isAuthenticated: boolean,
  router: RouterLike
): boolean {
  if (isAuthenticated) return true;
  promptLoginForReport(router);
  return false;
}
