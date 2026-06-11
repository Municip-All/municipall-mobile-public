# Municip'All — Application mobile

Application mobile citoyenne **Municip'All** pour iOS et Android. Permet aux habitants de signaler des problèmes, contacter leur mairie, consulter la vie locale et accéder aux services municipaux, le tout en marque blanche par commune.

## Vue d'ensemble

| Élément | Détail |
|---------|--------|
| Framework | Expo SDK 54, React Native 0.81 |
| Routing | expo-router 6 (file-based) |
| Langage | TypeScript 5.9 |
| Styling | NativeWind + Tailwind CSS v4 |
| HTTP | Axios |
| Cartes | react-native-maps |
| Build | EAS Build + expo-dev-client |

## Fonctionnalités

- **Multi-commune** — Marque blanche par tenant (`x-tenant-id`), détection GPS de la ville
- **Carte interactive** — Signalements, composteurs, sanisettes, transport
- **Signalements** — Création géolocalisée avec photo, suivi de statut, chat avec la mairie
- **Contact mairie** — Tickets de suggestion avec fil de discussion
- **Vie locale** — Événements, travaux, collecte des déchets, météo
- **Transport** — Perturbations IDFM (si activé par la commune)
- **Communauté** — Associations, profil public de la commune
- **Compte utilisateur** — Inscription, profil, avatar, statistiques
- **Notifications push** — Via Expo Push (nécessite un dev client, pas Expo Go)
- **Thème** — Mode clair/sombre avec couleurs de la commune
- **Conformité** — Onboarding, CGU, politique de confidentialité, RGPD

## Structure du projet

```
app/                    # Écrans (expo-router)
├── _layout.tsx         # Providers, onboarding, fonts
├── home.tsx            # Tableau de bord
├── carte.tsx           # Carte + signalements
├── events.tsx          # Événements
├── contact.tsx         # Contact mairie
├── profile.tsx         # Profil utilisateur
├── legal/              # Documents légaux
└── ...

components/             # Composants UI
├── map/                # Carte (native + web)
├── bottombar.tsx       # Navigation principale
└── ...

context/                # Auth, City, Theme
services/               # Couche API (14 modules)
constants/              # Config, branding, contenu légal
hooks/                  # Hooks personnalisés
lib/                    # Utilitaires (geo, map, auth)
```

## Navigation principale

| Onglet | Route | Écran |
|--------|-------|-------|
| Accueil | `/home` | Dashboard (météo, highlights) |
| Événements | `/events` | Agenda municipal |
| Signaler | `/carte` | Carte interactive (FAB central) |
| Contact | `/contact` | Messages à la mairie |
| Profil | `/profile` | Compte et paramètres |

## Prérequis

- Node.js 18+
- npm
- Pour iOS : Xcode (macOS)
- Pour Android : Android Studio
- Compte Expo (pour EAS Build et push notifications)
- **expo-dev-client** requis (Expo Go ne supporte pas les push SDK 53+)

## Installation

```bash
npm install
cp .env.example .env
# Configurer EXPO_PUBLIC_EAS_PROJECT_ID si nécessaire
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_EAS_PROJECT_ID` | UUID du projet EAS (push notifications) |
| `IOS_PERSONAL_TEAM` | `1` pour compte Apple gratuit (désactive push) |
| `IOS_BUNDLE_IDENTIFIER` | Bundle ID personnalisé (optionnel, personal team) |

Les URLs API sont définies dans `constants/Config.ts` :

| Environnement | URL |
|---------------|-----|
| Dev | `https://dev.api.municipall.dev/api/v1/` |
| Prod | `https://api.municipall.dev/api/v1/` |

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Metro bundler (dev client) |
| `npm run ios` | Build et lance sur simulateur/appareil iOS |
| `npm run android` | Build et lance sur émulateur/appareil Android |
| `npm run prebuild` | Génère les projets natifs |
| `npm run ios:rebuild` | Rebuild complet iOS (prebuild + pods + run) |
| `npm run lint` | ESLint + Prettier check |
| `npm run typecheck` | Vérification TypeScript |
| `npm run format` | Formatage automatique |

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer Metro (dev client requis sur l'appareil)
npm run start:dev

# 3. Build natif (première fois)
npm run ios      # ou npm run android
```

### Notifications push

1. `npx eas login`
2. `npx eas init` (ou utiliser le `projectId` dans `eas.json`)
3. Build sur appareil physique : `npm run ios` / `npm run android`
4. L'app enregistre le token via `POST /users/push-token`

### iPhone avec compte Apple gratuit

Définir `IOS_PERSONAL_TEAM=1` dans `.env`. Les notifications push seront désactivées (limitation Apple).

## Build EAS

Profils disponibles dans `eas.json` :

| Profil | Usage |
|--------|-------|
| `development` | Dev client, distribution interne |
| `preview` | Distribution interne (test) |
| `production` | Store / production |

```bash
npx eas build --profile development --platform ios
npx eas build --profile production --platform android
```

## Intégration API

Le client HTTP (`services/apiClient.ts`) envoie automatiquement :

- `Authorization: Bearer <token>` (depuis AsyncStorage)
- `x-tenant-id` (commune active, défaut `city-1`)

Services principaux : `cityService`, `reportService`, `contactService`, `eventsService`, `constructionWorksService`, `transportService`, `userProfileService`, `pushNotifications`.

Données externes : Paris Open Data (composteurs, sanisettes) via `openDataService`.

## CI

GitHub Actions exécute lint et typecheck sur les branches `main` et `dev` (pas de build EAS en CI).

## Écosystème Municip'All

| Projet | Rôle |
|--------|------|
| [municipall-backend-public](../municipall-backend-public) | API REST |
| [municipall-frontend-public](../municipall-frontend-public) | Site vitrine |
| [municipall-web-backoffice-public](../municipall-web-backoffice-public) | Backoffice mairie |
| [municipall-webadmin-public](../municipall-webadmin-public) | Administration plateforme |

## Licence

Projet privé
