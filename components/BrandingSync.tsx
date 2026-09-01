import { useEffect } from 'react';
import { useAuth } from '@context/authcontext';
import { useCity } from '@context/citycontext';

export default function BrandingSync() {
  const { user, isAuthenticated } = useAuth();
  const { applyBrandingCity, tenantId } = useCity();

  useEffect(() => {
    if (!isAuthenticated || !user?.cityId) return;
    if (user.cityId === tenantId) return;
    void applyBrandingCity(user.cityId);
  }, [isAuthenticated, user?.cityId, tenantId, applyBrandingCity]);

  return null;
}
