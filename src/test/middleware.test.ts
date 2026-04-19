import { describe, it, expect, vi } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mocking Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

// Mocking logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    security: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Middleware Route Protection', () => {
  const createRequest = (path: string) => {
    const url = new URL(`http://localhost:3000${path}`);
    return new NextRequest(url);
  };

  it('redirects unauthenticated users from protected routes to home with login param', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
    (createServerClient as any).mockReturnValue({
      auth: { getUser: mockGetUser }
    });

    const req = createRequest('/resources');
    const res = await middleware(req);

    expect(res?.status).toBe(307); // Temporary redirect
    expect(res?.headers.get('location')).toContain('/?login=true&redirect=%2Fresources');
  });

  it('allows authenticated users to access protected routes', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: '123' } } });
    (createServerClient as any).mockReturnValue({
      auth: { getUser: mockGetUser }
    });

    const req = createRequest('/resources');
    const res = await middleware(req);

    // If allowed, it returns the default response (NextResponse.next())
    // In our middleware, we set a custom header or just return the response
    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
  });

  it('allows everyone to access public routes', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
    (createServerClient as any).mockReturnValue({
      auth: { getUser: mockGetUser }
    });

    const req = createRequest('/');
    const res = await middleware(req);

    expect(res?.status).toBe(200);
  });
});
