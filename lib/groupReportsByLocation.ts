import type { Report } from '../services/reportService';
import type { ReportStatusDot } from './reportMapTypes';

function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0)
  );
}

export type ReportLocationGroup = {
  key: string;
  lat: number;
  lon: number;
  reports: Report[];
};

function locationKey(lat: number, lon: number): string {
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

export function groupReportsByLocation(reports: Report[]): ReportLocationGroup[] {
  const byKey = new Map<string, Report[]>();

  for (const report of reports.filter((r) => isValidCoordinate(r.lat, r.lon))) {
    const key = locationKey(report.lat, report.lon);
    const list = byKey.get(key) ?? [];
    list.push(report);
    byKey.set(key, list);
  }

  return Array.from(byKey.entries()).map(([key, grouped]) => {
    const [lat, lon] = key.split(',').map(Number);
    return {
      key,
      lat,
      lon,
      reports: grouped.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }),
    };
  });
}

/** Statut le plus urgent du groupe (pour la pastille du pin). */
export function dominantReportStatusDot(reports: Report[]): ReportStatusDot {
  const order = ['En attente', 'En cours', 'Résolu'] as const;
  for (const status of order) {
    if (reports.some((r) => r.status === status)) {
      switch (status) {
        case 'En attente':
          return 'orange';
        case 'En cours':
          return 'blue';
        case 'Résolu':
          return 'green';
      }
    }
  }
  return 'gray';
}
