import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { normaliseRange, aggregateEvents, VALID_RANGES } from '@/lib/analytics-utils';
import type { RawEvent } from '@/lib/analytics-utils';

// Generate ISO date strings safely from integer timestamps to avoid Invalid Date errors
const safeISODate = fc
  .integer({ min: 0, max: 4102444800000 }) // 1970-01-01 to 2100-01-01
  .map((ms) => new Date(ms).toISOString());

const eventArb = fc.record({
  path: fc.webPath(),
  session_id: fc.uuid(),
  created_at: safeISODate,
});

// Feature: cms-architecture, Property 15
describe('Property 15: Analytics stats response shape for any valid range', () => {
  it('returns all required fields for any valid range', () => {
    // **Validates: Requirements 7.3**
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_RANGES),
        fc.array(eventArb, { minLength: 0, maxLength: 50 }),
        (_range, events) => {
          const stats = aggregateEvents(events);
          return (
            typeof stats.totalViews === 'number' &&
            typeof stats.uniqueVisitors === 'number' &&
            Array.isArray(stats.topPages) &&
            Array.isArray(stats.chartData)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('totalViews is always a non-negative integer', () => {
    // **Validates: Requirements 7.3**
    fc.assert(
      fc.property(fc.array(eventArb), (events) => {
        const { totalViews } = aggregateEvents(events);
        return Number.isInteger(totalViews) && totalViews >= 0;
      }),
      { numRuns: 100 }
    );
  });

  it('uniqueVisitors is always a non-negative integer', () => {
    // **Validates: Requirements 7.3**
    fc.assert(
      fc.property(fc.array(eventArb), (events) => {
        const { uniqueVisitors } = aggregateEvents(events);
        return Number.isInteger(uniqueVisitors) && uniqueVisitors >= 0;
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: cms-architecture, Property 16
describe('Property 16: Invalid range defaults to 7d', () => {
  it('normalises any invalid range to 7d', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        fc.string().filter((s) => !(['24h', '7d', '30d'] as string[]).includes(s)),
        (invalidRange) => {
          const { range } = normaliseRange(invalidRange);
          return range === '7d';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('normalises null (absent range) to 7d', () => {
    // **Validates: Requirements 7.4**
    const { range } = normaliseRange(null);
    expect(range).toBe('7d');
  });

  it('normalises empty string to 7d', () => {
    // **Validates: Requirements 7.4**
    const { range } = normaliseRange('');
    expect(range).toBe('7d');
  });

  it('startDate for invalid range is within 1 second of the 7d window', () => {
    // **Validates: Requirements 7.4**
    fc.assert(
      fc.property(
        fc.string().filter((s) => !(['24h', '7d', '30d'] as string[]).includes(s)),
        (invalidRange) => {
          const { startDate } = normaliseRange(invalidRange);
          const { startDate: sevenDayStart } = normaliseRange('7d');
          return Math.abs(startDate.getTime() - sevenDayStart.getTime()) < 1000;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserves valid ranges unchanged', () => {
    // **Validates: Requirements 7.4**
    for (const validRange of VALID_RANGES) {
      const { range } = normaliseRange(validRange);
      expect(range).toBe(validRange);
    }
  });
});

// Feature: cms-architecture, Property 17
describe('Property 17: Unique visitor count equals distinct session IDs', () => {
  const sessionEventArb = fc.record({
    path: fc.webPath(),
    session_id: fc.constantFrom('a', 'b', 'c', 'd'),
    created_at: safeISODate,
  });

  it('uniqueVisitors equals count of distinct session_id values', () => {
    // **Validates: Requirements 7.5**
    fc.assert(
      fc.property(
        fc.array(sessionEventArb, { minLength: 1, maxLength: 50 }),
        (events) => {
          const { uniqueVisitors } = aggregateEvents(events);
          const expectedUnique = new Set(events.map((e) => e.session_id)).size;
          return uniqueVisitors === expectedUnique;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('uniqueVisitors is less than or equal to totalViews', () => {
    // **Validates: Requirements 7.5**
    fc.assert(
      fc.property(
        fc.array(sessionEventArb, { minLength: 1, maxLength: 50 }),
        (events) => {
          const { uniqueVisitors, totalViews } = aggregateEvents(events);
          return uniqueVisitors <= totalViews;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('uniqueVisitors equals totalViews when all session_ids are distinct', () => {
    // **Validates: Requirements 7.5**
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }).chain((ids) => {
          const uniqueIds = [...new Set(ids)];
          return fc.constant(
            uniqueIds.map((id) => ({
              path: '/',
              session_id: id,
              created_at: new Date().toISOString(),
            }))
          );
        }),
        (events) => {
          const { uniqueVisitors, totalViews } = aggregateEvents(events);
          return uniqueVisitors === totalViews;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('uniqueVisitors is 1 when all events share the same session_id', () => {
    // **Validates: Requirements 7.5**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            path: fc.webPath(),
            session_id: fc.constant('same-session'),
            created_at: safeISODate,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (events) => {
          const { uniqueVisitors } = aggregateEvents(events);
          return uniqueVisitors === 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Additional unit tests for aggregation correctness
describe('aggregateEvents: topPages aggregation', () => {
  it('returns top 10 pages sorted by views descending', () => {
    const events: RawEvent[] = [];
    for (let i = 0; i < 5; i++) events.push({ path: '/a', session_id: `s${i}`, created_at: '2024-01-01T00:00:00Z' });
    for (let i = 0; i < 3; i++) events.push({ path: '/b', session_id: `s${i}`, created_at: '2024-01-01T00:00:00Z' });
    events.push({ path: '/c', session_id: 's0', created_at: '2024-01-01T00:00:00Z' });

    const { topPages } = aggregateEvents(events);
    expect(topPages[0]).toEqual({ path: '/a', views: 5 });
    expect(topPages[1]).toEqual({ path: '/b', views: 3 });
    expect(topPages[2]).toEqual({ path: '/c', views: 1 });
  });

  it('limits topPages to 10 entries', () => {
    const events: RawEvent[] = Array.from({ length: 15 }, (_, i) => ({
      path: `/page-${i}`,
      session_id: `s${i}`,
      created_at: '2024-01-01T00:00:00Z',
    }));
    const { topPages } = aggregateEvents(events);
    expect(topPages.length).toBeLessThanOrEqual(10);
  });
});

describe('aggregateEvents: chartData aggregation', () => {
  it('groups events by calendar day and sorts ascending', () => {
    const events: RawEvent[] = [
      { path: '/', session_id: 's1', created_at: '2024-01-03T10:00:00Z' },
      { path: '/', session_id: 's2', created_at: '2024-01-01T08:00:00Z' },
      { path: '/', session_id: 's3', created_at: '2024-01-01T20:00:00Z' },
      { path: '/', session_id: 's4', created_at: '2024-01-02T12:00:00Z' },
    ];
    const { chartData } = aggregateEvents(events);
    expect(chartData).toEqual([
      { name: '2024-01-01', views: 2 },
      { name: '2024-01-02', views: 1 },
      { name: '2024-01-03', views: 1 },
    ]);
  });
});
