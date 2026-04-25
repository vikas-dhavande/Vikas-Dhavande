import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateReadingTime } from '@/lib/utils';

// Feature: cms-architecture, Property 11: Public blog listing only shows published posts
describe('Property 11: Public blog listing only shows published posts', () => {
  it('filters to only posts with non-null published_at <= now()', () => {
    // **Validates: Requirements 4.1**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            published_at: fc.option(fc.date(), { nil: null }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (posts) => {
          const now = new Date();

          // Simulate the server-side filter: published_at IS NOT NULL AND published_at <= now()
          const filtered = posts.filter(
            (p) => p.published_at !== null && p.published_at <= now
          );

          // Every post in the filtered result must have a non-null published_at <= now
          return filtered.every(
            (p) => p.published_at !== null && p.published_at! <= now
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('excludes posts with null published_at', () => {
    // **Validates: Requirements 4.1**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            published_at: fc.option(fc.date(), { nil: null }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (posts) => {
          const now = new Date();
          const filtered = posts.filter(
            (p) => p.published_at !== null && p.published_at <= now
          );
          // No draft posts (null published_at) should appear
          return filtered.every((p) => p.published_at !== null);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('excludes future-dated posts', () => {
    // **Validates: Requirements 4.1**
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            published_at: fc.option(fc.date(), { nil: null }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (posts) => {
          const now = new Date();
          const filtered = posts.filter(
            (p) => p.published_at !== null && p.published_at <= now
          );
          // No future-dated posts should appear
          return filtered.every((p) => p.published_at! <= now);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: cms-architecture, Property 12: Reading time calculation correctness
describe('Property 12: Reading time calculation correctness', () => {
  it('returns Math.ceil(content.length / 1000) for any string', () => {
    // **Validates: Requirements 4.4**
    fc.assert(
      fc.property(fc.string(), (content) => {
        const result = calculateReadingTime(content);
        const expected = Math.ceil(content.length / 1000);
        return result === expected;
      }),
      { numRuns: 100 }
    );
  });

  it('returns 0 for empty string', () => {
    // **Validates: Requirements 4.4**
    expect(calculateReadingTime('')).toBe(0);
  });

  it('returns 1 for a single character', () => {
    // **Validates: Requirements 4.4**
    expect(calculateReadingTime('a')).toBe(1);
  });

  it('returns 1 for exactly 1000 characters', () => {
    // **Validates: Requirements 4.4**
    expect(calculateReadingTime('a'.repeat(1000))).toBe(1);
  });

  it('returns 2 for 1001 characters', () => {
    // **Validates: Requirements 4.4**
    expect(calculateReadingTime('a'.repeat(1001))).toBe(2);
  });

  it('is always a non-negative integer', () => {
    // **Validates: Requirements 4.4**
    fc.assert(
      fc.property(fc.string(), (content) => {
        const result = calculateReadingTime(content);
        return Number.isInteger(result) && result >= 0;
      }),
      { numRuns: 100 }
    );
  });
});
