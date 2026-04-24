import type { AnalyticsStats } from '@/types';

export const VALID_RANGES = ['24h', '7d', '30d'] as const;
export type AnalyticsRange = typeof VALID_RANGES[number];

export interface NormalisedRange {
  range: AnalyticsRange;
  startDate: Date;
}

export function normaliseRange(raw: string | null): NormalisedRange {
  const range: AnalyticsRange =
    raw && (VALID_RANGES as readonly string[]).includes(raw)
      ? (raw as AnalyticsRange)
      : '7d';

  const now = new Date();
  const startDate = new Date(now);

  if (range === '24h') {
    startDate.setHours(startDate.getHours() - 24);
  } else if (range === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    startDate.setDate(startDate.getDate() - 7);
  }

  return { range, startDate };
}

export interface RawEvent {
  path: string;
  session_id: string;
  created_at: string;
}

export function aggregateEvents(events: RawEvent[]): AnalyticsStats {
  const totalViews = events.length;

  const uniqueVisitors = new Set(events.map((e) => e.session_id)).size;

  // topPages: group by path, count occurrences, top 10 desc
  const pathCounts: Record<string, number> = {};
  for (const event of events) {
    pathCounts[event.path] = (pathCounts[event.path] ?? 0) + 1;
  }
  const topPages = Object.entries(pathCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // chartData: group by calendar day (YYYY-MM-DD), sorted ascending
  const dayCounts: Record<string, number> = {};
  for (const event of events) {
    const day = event.created_at.slice(0, 10); // YYYY-MM-DD
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
  }
  const chartData = Object.entries(dayCounts)
    .map(([name, views]) => ({ name, views }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    totalViews,
    uniqueVisitors,
    bounceRate: 'N/A',
    topPages,
    chartData,
  };
}
