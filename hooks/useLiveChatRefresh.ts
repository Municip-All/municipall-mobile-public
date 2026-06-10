import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const DEFAULT_POLL_INTERVAL_MS = 5000;

/**
 * Rafraîchit une conversation tant que l'écran est au premier plan
 * (polling léger + reprise au retour dans l'app).
 */
export function useLiveChatRefresh(
  refresh: () => void | Promise<void>,
  enabled: boolean,
  intervalMs = DEFAULT_POLL_INTERVAL_MS
) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runRefresh = useCallback(() => {
    if (!enabledRef.current) return;
    void refreshRef.current();
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    if (!enabledRef.current) return;
    intervalRef.current = setInterval(runRefresh, intervalMs);
  }, [intervalMs, runRefresh, stopPolling]);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }
    startPolling();
    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  useFocusEffect(
    useCallback(() => {
      runRefresh();
      startPolling();

      const onAppStateChange = (state: AppStateStatus) => {
        if (state === 'active') {
          runRefresh();
          startPolling();
        } else {
          stopPolling();
        }
      };

      const subscription = AppState.addEventListener('change', onAppStateChange);

      return () => {
        stopPolling();
        subscription.remove();
      };
    }, [runRefresh, startPolling, stopPolling])
  );
}
