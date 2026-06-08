import { LEGAL_ENTITY, DEFAULT_CITY_DATA_RETENTION } from './legalEntity';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  id: string;
  title: string;
  subtitle: string;
  sections: LegalSection[];
};

export type CityLegalContext = {
  cityName?: string;
  dataRetentionPolicy?: string;
};

const E = LEGAL_ENTITY;

function retentionSection(ctx: CityLegalContext): LegalSection {
  const cityBlock = ctx.cityName
    ? `Commune concernée : ${ctx.cityName}.\n\n${ctx.dataRetentionPolicy?.trim() || DEFAULT_CITY_DATA_RETENTION}`
    : DEFAULT_CITY_DATA_RETENTION;

  return {
    title: '5. Durées de conservation',
    bullets: [
      "Données de compte : jusqu'à suppression du compte ou 3 ans d'inactivité, sauf obligation légale contraire.",
      "Photo de profil et préférences : jusqu'à suppression par l'utilisateur ou clôture du compte.",
      "Jetons de notification : jusqu'à retrait du consentement ou suppression du compte.",
      "Logs de sécurité et d'accès : 12 mois maximum, sauf incident nécessitant une conservation prolongée.",
    ],
    paragraphs: [
      `${E.legalName} est responsable de traitement. Les informations nécessaires au traitement de vos demandes sont transmises à la commune partenaire en sa qualité de destinataire habilité, dans le cadre du contrat qui lie ${E.legalName} à cette collectivité.`,
      'Durées spécifiques liées à votre commune (selon le contrat municipal) :',
      cityBlock,
    ],
  };
}

export function buildCguDocument(_ctx?: CityLegalContext): LegalDocument {
  return {
    id: 'cgu',
    title: "Conditions générales d'utilisation",
    subtitle: `Version ${E.documentVersion} — ${E.lastUpdated} — ${E.legalName}`,
    sections: [
      {
        title: '1. Objet',
        paragraphs: [
          `Les présentes Conditions générales d'utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de l'application mobile ${E.appName}, ${E.appDescription}`,
          `L'Application est éditée par ${E.legalName}, ${E.legalForm} au capital indiqué dans les mentions légales, dont le siège est situé ${E.publisherAddress}. En créant un compte ou en utilisant l'Application, vous acceptez les présentes CGU.`,
        ],
      },
      {
        title: '2. Public et compte utilisateur',
        paragraphs: [
          `L'Application est réservée aux personnes âgées d'au moins ${E.minimumAge} ans. Aucune autorisation parentale n'est requise pour ouvrir un compte à partir de ${E.minimumAge} ans. Les titulaires de l'autorité parentale peuvent néanmoins exercer les droits prévus par le RGPD pour le compte d'un mineur.`,
          'Vous devez fournir des informations exactes lors de la création du compte et les maintenir à jour via votre espace Profil.',
          'Vous êtes responsable de la confidentialité de vos identifiants.',
        ],
      },
      {
        title: '3. Services proposés',
        bullets: [
          'Informations municipales (travaux, collecte, événements, carte).',
          'Signalements géolocalisés transmis à la commune partenaire.',
          'Contact et suivi des échanges avec les services municipaux.',
          'Gestion du profil, préférences et notifications (selon modules activés).',
        ],
        paragraphs: [
          'Les fonctionnalités disponibles dépendent de la commune sélectionnée et des modules activés par celle-ci.',
        ],
      },
      {
        title: '4. Signalements et contenus',
        paragraphs: [
          "Les contenus publiés doivent être licites et pertinents. L'Éditeur et la commune peuvent traiter, conserver et transmettre ces données aux fins de gestion du service public local.",
          "L'Éditeur peut suspendre un compte en cas d'usage abusif ou frauduleux.",
        ],
      },
      {
        title: '5. Responsabilité',
        paragraphs: [
          "L'Éditeur n'est pas responsable des délais de traitement par la commune ni des décisions administratives prises par celle-ci.",
          "L'Application est fournie avec une obligation de moyens ; un accès ininterrompu n'est pas garanti.",
        ],
      },
      {
        title: '6. Données personnelles',
        paragraphs: [
          `${E.legalName} est le responsable de traitement au sens du RGPD. La politique de confidentialité détaille vos droits et les durées de conservation, y compris celles applicables via votre commune.`,
          `Contact : ${E.privacyEmail} — DPO : ${E.dpoName} (${E.dpoEmail}).`,
        ],
      },
      {
        title: '7. Modifications et droit applicable',
        paragraphs: [
          "Les CGU peuvent être modifiées ; la version en vigueur est celle accessible dans l'Application.",
          'Droit français applicable. Litiges : recherche amiable préalable, puis tribunaux compétents.',
        ],
      },
      {
        title: '8. Contact',
        paragraphs: [`${E.contactEmail} — ${E.website}`],
      },
    ],
  };
}

export function buildPrivacyDocument(ctx: CityLegalContext = {}): LegalDocument {
  return {
    id: 'privacy',
    title: 'Politique de confidentialité (RGPD)',
    subtitle: `Responsable : ${E.legalName} — DPO : ${E.dpoName} — ${E.lastUpdated}`,
    sections: [
      {
        title: '1. Responsable de traitement',
        paragraphs: [
          `Le responsable de traitement des données collectées via ${E.appName} est ${E.legalName} (${E.legalForm}), ${E.publisherAddress}.`,
          `Délégué à la protection des données (DPO) : ${E.dpoName}, contact : ${E.dpoEmail}.`,
          "Aucun autre responsable de traitement n'est désigné dans le cadre de cette Application : les communes partenaires reçoivent les données strictement nécessaires au traitement de vos demandes, en qualité de destinataires habilités.",
        ],
      },
      {
        title: '2. Finalités et bases légales',
        bullets: [
          'Gestion du compte et authentification (exécution du contrat).',
          "Signalements et contact mairie (exécution du service / mission d'intérêt public local).",
          "Géolocalisation ponctuelle lors d'un signalement (action positive de l'utilisateur).",
          'Notifications push (consentement, révocable).',
          'Sécurité et lutte contre les abus (intérêt légitime).',
          'Obligations légales et réponses aux autorités.',
        ],
      },
      {
        title: '3. Données traitées',
        bullets: [
          'Identité et contact : nom, prénom, e-mail, téléphone, photo de profil, ville de résidence.',
          'Localisation : coordonnées liées à un signalement ou à la détection de commune.',
          'Contenus : textes, photos, historique des échanges.',
          'Technique : identifiants de session, jeton push, logs de connexion.',
        ],
      },
      {
        title: '4. Destinataires et sous-traitants',
        paragraphs: [
          "Données accessibles aux équipes habilitées de l'Éditeur et, le cas échéant, aux agents de la commune partenaire pour le traitement de vos demandes.",
        ],
        bullets: [
          E.hostingDescription,
          'Prestataire de notifications (Expo, Apple, Google) si vous activez les alertes.',
        ],
      },
      retentionSection(ctx),
      {
        title: '6. Vos droits',
        paragraphs: [
          'Accès, rectification, effacement, limitation, opposition, portabilité (si applicable), retrait du consentement.',
          `Exercice : section « Mes données » dans Profil, ou ${E.privacyEmail}.`,
          `Réclamation CNIL : ${E.cnilComplaintUrl}`,
        ],
      },
      {
        title: '7. Sécurité et hébergement',
        paragraphs: [
          'Échanges chiffrés (HTTPS), accès restreint, sauvegardes et mesures organisationnelles adaptées.',
          `Hébergeur : ${E.hostingProvider} — ${E.hostingLocation}.`,
        ],
      },
      {
        title: '8. Mineurs',
        paragraphs: [
          `L'Application est destinée aux personnes de ${E.minimumAge} ans et plus. Aucune autorisation parentale n'est exigée pour s'inscrire à partir de ${E.minimumAge} ans. Pour les mineurs, les titulaires de l'autorité parentale peuvent exercer les droits RGPD en contactant ${E.dpoEmail}.`,
        ],
      },
      {
        title: '9. Transferts hors UE',
        paragraphs: [
          "Les données sont hébergées en France. Tout transfert hors Union européenne ferait l'objet de garanties appropriées (clauses contractuelles types, etc.).",
        ],
      },
      {
        title: '10. Mise à jour',
        paragraphs: [
          `Version ${E.documentVersion} — ${E.lastUpdated}. Les durées liées à votre commune peuvent évoluer selon le contrat municipal ; la version affichée est celle enregistrée pour votre ville de résidence ou de consultation.`,
        ],
      },
    ],
  };
}

export function buildMentionsDocument(): LegalDocument {
  return {
    id: 'mentions',
    title: 'Mentions légales',
    subtitle: `${E.legalName} — ${E.lastUpdated}`,
    sections: [
      {
        title: 'Éditeur',
        bullets: [
          `${E.legalName} (${E.legalForm})`,
          `Siège social : ${E.publisherAddress}`,
          `E-mail : ${E.contactEmail}`,
          `Site : ${E.website}`,
          `SIRET : ${E.siret}`,
          `RCS : ${E.rcs}`,
          `Capital : ${E.capital}`,
        ],
      },
      {
        title: 'Directeur de la publication',
        paragraphs: [E.directorOfPublication],
      },
      {
        title: 'Délégué à la protection des données',
        paragraphs: [`${E.dpoName} — ${E.dpoEmail}`],
      },
      {
        title: 'Hébergement',
        paragraphs: [`Hébergeur : ${E.hostingProvider}`, E.hostingLocation, E.hostingDescription],
      },
      {
        title: 'Propriété intellectuelle',
        paragraphs: [
          `La marque ${E.appName} et l'ensemble des contenus de l'Application sont protégés. Toute reproduction non autorisée est interdite.`,
        ],
      },
      {
        title: 'Signalement de contenus illicites',
        paragraphs: [`Contact : ${E.contactEmail}`],
      },
    ],
  };
}

export function buildCookiesDocument(): LegalDocument {
  return {
    id: 'cookies',
    title: 'Traceurs et données locales',
    subtitle: 'Application mobile — stockage sur appareil',
    sections: [
      {
        title: '1. Principe',
        paragraphs: [
          `${E.appName} n'utilise pas de cookies publicitaires tiers dans un navigateur.`,
          'Des stockages locaux et identifiants techniques sont utilisés pour le fonctionnement du service.',
        ],
      },
      {
        title: '2. Stockage local',
        bullets: [
          'Session et préférences de connexion.',
          'Consentements légaux (CGU, confidentialité, âge minimum).',
          'Thème et préférences de notifications.',
        ],
      },
      {
        title: '3. Géolocalisation et notifications',
        paragraphs: [
          'La position est collectée uniquement avec votre accord, pour la carte ou un signalement.',
          'Les notifications push reposent sur votre consentement explicite.',
        ],
      },
      {
        title: '4. Contact',
        paragraphs: [E.privacyEmail],
      },
    ],
  };
}

export const LEGAL_HUB_ITEMS = [
  {
    id: 'privacy',
    route: '/legal/privacy' as const,
    label: 'Politique de confidentialité',
    description: 'RGPD, finalités, durées, vos droits',
    icon: 'shield-outline' as const,
    color: '#007AFF',
  },
  {
    id: 'cgu',
    route: '/legal/cgu' as const,
    label: "Conditions d'utilisation",
    description: "CGU de l'application",
    icon: 'document-text-outline' as const,
    color: '#34C759',
  },
  {
    id: 'my-data',
    route: '/legal/my-data' as const,
    label: 'Mes données personnelles',
    description: 'Exercer vos droits RGPD',
    icon: 'person-circle-outline' as const,
    color: '#FF9500',
    requiresAuth: true,
  },
  {
    id: 'mentions',
    route: '/legal/mentions-legales' as const,
    label: 'Mentions légales',
    description: 'Éditeur, hébergement, DPO',
    icon: 'information-circle-outline' as const,
    color: '#AF52DE',
  },
  {
    id: 'cookies',
    route: '/legal/cookies' as const,
    label: 'Traceurs & stockage local',
    description: 'Données sur votre appareil',
    icon: 'phone-portrait-outline' as const,
    color: '#5856D6',
  },
];
