/**
 * Identité légale affichée dans l'application mobile Municip'All.
 */
export const LEGAL_ENTITY = {
  appName: "Municip'All",
  appDescription:
    "application mobile permettant aux citoyens d'accéder aux services municipaux (signalements, travaux, événements, contact avec la mairie).",

  /** Forme juridique adaptée à un éditeur SaaS B2B2G en France */
  legalForm: 'SAS',
  publisherName: 'Municipall',
  legalName: 'Municipall SAS',
  publisherAddress: '24 Rue Pasteur, 94270 Le Kremlin-Bicêtre, France',
  publisherCountry: 'France',

  directorOfPublication: 'Représentant légal de Municipall SAS',
  siret: 'Sur demande à contact@municipall.dev',
  rcs: 'Sur demande à contact@municipall.dev',
  capital: 'Sur demande à contact@municipall.dev',

  website: 'https://municipall.dev',
  contactEmail: 'contact@municipall.dev',
  privacyEmail: 'privacy@municipall.dev',
  supportEmail: 'support@municipall.dev',
  dpoName: 'Alexandre BOISSEL',
  dpoEmail: 'privacy@municipall.dev',

  hostingProvider: 'LWS (Ligne Web Services)',
  hostingLocation: 'Datacenter situé à Belfort, France',
  hostingDescription:
    "Les données sont hébergées par LWS (Ligne Web Services), sur des serveurs dont le datacenter est situé à Belfort (France), au sein de l'Union européenne.",

  /** Âge minimum — en France, pas d'autorisation parentale requise à partir de 16 ans pour ce type de service */
  minimumAge: 16,

  documentVersion: '1.1',
  lastUpdated: '4 juin 2025',
  cnilComplaintUrl: 'https://www.cnil.fr/fr/plaintes',
} as const;

export const LEGAL_CONSENT_VERSION = `legal-${LEGAL_ENTITY.documentVersion}-${LEGAL_ENTITY.lastUpdated}`;

export const DEFAULT_CITY_DATA_RETENTION = `Durées par défaut lorsqu'aucune convention spécifique n'est renseignée pour votre commune : signalements et messages associés conservés jusqu'à 36 mois après clôture du dossier ; compte citoyen supprimé ou anonymisé dans les 30 jours suivant une demande d'effacement ; journaux techniques (sécurité) conservés 12 mois maximum.`;
