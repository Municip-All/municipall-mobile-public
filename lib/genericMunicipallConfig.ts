import { DEFAULT_PRIMARY } from '@constants/design';
import type { CityConfig } from '../services/cityService';

/** Config locale pour les comptes sans commune partenaire (aucun service municipal). */
export function buildGenericMunicipallConfig(): CityConfig {
  return {
    id: 'municipall',
    name: "Municip'All",
    officialName: "Municip'All",
    features: [],
    theme: {
      primaryColor: DEFAULT_PRIMARY,
      secondaryColor: '#6366F1',
      useGradient: true,
      logoUrl: '',
    },
    isTransportFeatureAllowed: false,
    isTransportFeatureEnabled: false,
  };
}
