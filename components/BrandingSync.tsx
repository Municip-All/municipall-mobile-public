import { useEffect, useRef } from 'react';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';
import { isPartnerCity } from '../lib/partnerCities';
import { getPartnerCitiesCached } from '../services/partnerCitiesCache';

/**
 * Applique la marque de la commune de l'utilisateur connecté
 * (prioritaire sur la détection GPS pour cohérence marque blanche).
 * Comptes sans commune partenaire → marque Municip'All générique.
 */
export default function BrandingSync() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { applyBrandingCity, applyGenericBranding, reinitializeFromLocation } = useCity();
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      // Ne réinitialise que après une déconnexion explicite (pas au premier chargement).
      if (wasAuthenticatedRef.current) {
        void reinitializeFromLocation();
      }
      wasAuthenticatedRef.current = false;
      return;
    }

    wasAuthenticatedRef.current = true;

    if (!user?.cityId) {
      applyGenericBranding();
      return;
    }

    let cancelled = false;

    // Applique la marque immédiatement (ne dépend pas de la liste partenaires).
    void applyBrandingCity(user.cityId).then(() => {
      if (cancelled) return;
      // Vérification en arrière-plan : commune référencée mais plus partenaire.
      getPartnerCitiesCached()
        .then((cities) => {
          if (cancelled) return;
          if (cities.length > 0 && !isPartnerCity(user.cityId, cities)) {
            applyGenericBranding();
          }
        })
        .catch(() => {
          // 429 / réseau : on garde la marque appliquée via cityId du profil.
        });
    });

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    user?.cityId,
    applyBrandingCity,
    applyGenericBranding,
    reinitializeFromLocation,
  ]);

  return null;
}
