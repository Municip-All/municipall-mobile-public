import { useEffect, useRef } from 'react';
import { useAuth } from '../context/authcontext';
import {
  isPushSupportedEnvironment,
  syncPushTokenWithBackend,
} from '../services/pushNotifications';

/** Enregistre le token Expo Push quand l'utilisateur est connecté. */
export default function PushNotificationRegistrar() {
  const { isAuthenticated, isLoading } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isPushSupportedEnvironment()) return;

    if (!isAuthenticated) {
      syncedRef.current = false;
      return;
    }

    if (syncedRef.current) return;
    syncedRef.current = true;

    void syncPushTokenWithBackend();
  }, [isAuthenticated, isLoading]);

  return null;
}
