export interface WasteServiceSchedule {
  type: string;
  icon: string;
  color: string;
  days: number[];
  time: string;
}

export function getNextCollection(
  schedule: WasteServiceSchedule[],
): { date: Date; service: WasteServiceSchedule } | null {
  if (!schedule.length) return null;

  const now = new Date();
  let nearest: { date: Date; service: WasteServiceSchedule } | null = null;

  for (const service of schedule) {
    for (const day of service.days) {
      const d = new Date();
      const diff = (day - now.getDay() + 7) % 7;
      d.setDate(now.getDate() + diff);

      const [h, m] = service.time.split(':').map(Number);
      d.setHours(h, m, 0, 0);

      if (d <= now) {
        d.setDate(d.getDate() + 7);
      }

      if (!nearest || d < nearest.date) {
        nearest = { date: d, service };
      }
    }
  }

  return nearest;
}

export function formatCollectionDay(date: Date): string {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return "aujourd'hui";
  if (date.toDateString() === tomorrow.toDateString()) return 'demain';

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
