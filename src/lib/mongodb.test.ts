// Feature: cms-architecture, Property 14
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// We need to reset module state between tests
let connectToDatabase: () => Promise<import('mongodb').MongoClient | null>;

describe('MongoDB singleton utility', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const mod = await import('./mongodb.ts');
    connectToDatabase = mod.connectToDatabase;
  });

  /**
   * Property 14: MongoDB connectToDatabase idempotence
   * For any N ≥ 2 sequential calls to connectToDatabase() in the same process,
   * all calls must return the same MongoClient instance (reference equality).
   * Validates: Requirements 6.2, 6.5, 6.6
   */
  it('Property 14: connectToDatabase returns the same instance for N sequential calls', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 20 }), async (n) => {
        // Reset module state for each property run
        vi.resetModules();
        const mod = await import('./mongodb.ts');
        const fn = mod.connectToDatabase;

        // Create a stable mock client object
        const mockClient = { db: vi.fn(), close: vi.fn() } as unknown as import('mongodb').MongoClient;

        // Mock MongoClient.connect to return the stable object
        const { MongoClient } = await import('mongodb');
        vi.spyOn(MongoClient, 'connect').mockResolvedValue(mockClient);

        // Make N sequential calls
        const results: (import('mongodb').MongoClient | null)[] = [];
        for (let i = 0; i < n; i++) {
          results.push(await fn());
        }

        // All results must be the same instance
        return results.every((r) => r === results[0]);
      }),
      { numRuns: 100 }
    );
  });

  it('returns null and resets cachedPromise on connection failure', async () => {
    vi.resetModules();
    const mod = await import('./mongodb.ts');
    const fn = mod.connectToDatabase;

    const { MongoClient } = await import('mongodb');
    vi.spyOn(MongoClient, 'connect').mockRejectedValue(new Error('Connection refused'));

    const result = await fn();
    expect(result).toBeNull();

    // After failure, a subsequent call should attempt a new connection
    const mockClient = { db: vi.fn() } as unknown as import('mongodb').MongoClient;
    vi.spyOn(MongoClient, 'connect').mockResolvedValue(mockClient);
    const result2 = await fn();
    expect(result2).toBe(mockClient);
  });
});
