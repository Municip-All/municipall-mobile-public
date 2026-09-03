export const DEFAULT_MAP_CENTER = {
  latitude: 48.8566,
  longitude: 2.3522,
};

export const DEFAULT_MAP_ZOOM = 12;

/** Rayon max (m) pour afficher compost / toilettes autour du centre de la carte. */
export const MAP_MARKER_MAX_RADIUS_M = 3000;

export const MAX_COMPOST_MARKERS_VISIBLE = 8;
export const MAX_TOILET_MARKERS_VISIBLE = 10;
export const MAX_REPORT_MARKERS_VISIBLE = 15;

export const TRANSPORT_REFETCH_DEBOUNCE_MS = 2200;
export const TRANSPORT_REFETCH_MIN_MOVE_M = 900;

/** Déplacement minimum avant de recalculer compost / toilettes visibles. */
export const MARKER_FILTER_MIN_MOVE_M = 700;

/**
 * Taille cible des pins sur la carte (~40 pt).
 * Les PNG doivent avoir max 120 px (3×) — iOS affiche les pixels natifs de l'image.
 */
export const MAP_PIN_ASSET_MAX_PX = 120;
export const DEFAULT_PIN_SIZE = 40;
