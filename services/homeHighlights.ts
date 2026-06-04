import { CityConfig } from './cityService';
import { CityEvent } from './eventsService';
import { ConstructionWork } from './constructionWorksService';
import {
  getNextCollection,
  formatCollectionDay,
  WasteServiceSchedule,
} from '../utils/wasteSchedule';

export type HighlightType = 'waste' | 'work' | 'event';

export interface HomeHighlight {
  id: string;
  type: HighlightType;
  title: string;
  body: string;
  meta: string;
  icon: 'trash' | 'refresh' | 'leaf' | 'archive' | 'flask' | 'construct' | 'calendar';
  iconColor: string;
  path: '/collecte' | '/travaux' | '/events';
  sortDate: Date;
}

const WASTE_ICON_MAP: Record<string, HomeHighlight['icon']> = {
  trash: 'trash',
  refresh: 'refresh',
  leaf: 'leaf',
  archive: 'archive',
  flask: 'flask',
};

function buildWasteHighlight(config: CityConfig): HomeHighlight | null {
  const services = config.wasteConfig?.services as WasteServiceSchedule[] | undefined;
  if (!services?.length) return null;

  const next = getNextCollection(services);
  if (!next) return null;

  const dayLabel = formatCollectionDay(next.date);
  const timeLabel = next.service.time.replace(':', 'h').slice(0, 5);

  return {
    id: 'waste-next',
    type: 'waste',
    title: `Collecte — ${next.service.type}`,
    body: `Prochain passage ${dayLabel} vers ${timeLabel}. Pensez à sortir vos bacs.`,
    meta: dayLabel.toUpperCase(),
    icon: WASTE_ICON_MAP[next.service.icon] ?? 'trash',
    iconColor: next.service.color || '#34C759',
    path: '/collecte',
    sortDate: next.date,
  };
}

function buildWorkHighlights(works: ConstructionWork[]): HomeHighlight[] {
  const now = Date.now();
  return works
    .filter((w) => w.status !== 'Terminé' && w.status !== 'Annulé')
    .filter((w) => new Date(w.endDate).getTime() >= now - 86400000)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3)
    .map((w) => {
      const end = new Date(w.endDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
      const impact = w.impactType || 'Travaux de voirie';
      const desc = w.description?.trim();
      return {
        id: `work-${w.id}`,
        type: 'work' as const,
        title: w.title,
        body: desc
          ? `${impact} — ${desc.slice(0, 100)}${desc.length > 100 ? '…' : ''}`
          : `${impact} jusqu'au ${end} inclus.`,
        meta: w.status.toUpperCase(),
        icon: 'construct' as const,
        iconColor: w.status === 'En cours' ? '#FF9500' : '#007AFF',
        path: '/travaux' as const,
        sortDate: new Date(w.updatedAt ?? w.startDate),
      };
    });
}

function buildEventHighlights(events: CityEvent[]): HomeHighlight[] {
  const now = Date.now();
  return events
    .filter((e) => new Date(e.endDate).getTime() >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3)
    .map((e) => {
      const start = new Date(e.startDate);
      const dateLabel = start.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: `event-${e.id}`,
        type: 'event' as const,
        title: e.title,
        body: e.description?.trim()
          ? `${e.location} — ${e.description.slice(0, 90)}${e.description.length > 90 ? '…' : ''}`
          : `${e.category} · ${e.location}`,
        meta: dateLabel.toUpperCase(),
        icon: 'calendar' as const,
        iconColor: '#AF52DE',
        path: '/events' as const,
        sortDate: start,
      };
    });
}

export function buildHomeHighlights(
  config: CityConfig | null,
  works: ConstructionWork[],
  events: CityEvent[],
): HomeHighlight[] {
  if (!config) return [];

  const items: HomeHighlight[] = [];

  const waste = buildWasteHighlight(config);
  if (waste) items.push(waste);

  items.push(...buildWorkHighlights(works));

  if (config.features?.includes('agenda')) {
    items.push(...buildEventHighlights(events));
  }

  return items.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime()).slice(0, 6);
}
