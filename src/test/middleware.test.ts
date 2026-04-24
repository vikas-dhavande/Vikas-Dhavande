import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

// Mocking Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

const makeSupabaseMock = (user: object | null, role?: string) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: role ? { role } : null }),
  }),
});

describe('Middleware Route Protection', () => {
  const createRequest = (path: string) => {
    const url = new URL(`http://localhost:3000${path}`);
    return new NextRequest(url);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users from protected routes to home with login param', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    (createServerClient as any).mockReturnValue(makeSupabaseMock(null));

    const req = createRequest('/resources');
    const res = await middleware(req);

    expect(res?.status).toBe(307);
    const location = res?.headers.get('location') ?? '';
    expect(location).toContain('login=true');
    expect(location).toContain('redirect=%2Fresources');
  });

  it('redirects non-admin authenticated users to home', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    (createServerClient as any).mockReturnValue(
      makeSupabaseMock({ id: '123' }, 'user')
    );

    const req = createRequest('/dashboard');
    const res = await middleware(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get('location')).toContain('/');
  });

  it('allows admin users to access protected routes', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    (createServerClient as any).mockReturnValue(
      makeSupabaseMock({ id: '123' }, 'admin')
    );

    const req = createRequest('/dashboard');
    const res = await middleware(req);

    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
  });

  it('allows super_user to access protected routes', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    (createServerClient as any).mockReturnValue(
      makeSupabaseMock({ id: '456' }, 'super_user')
    );

    const req = createRequest('/resources/files');
    const res = await middleware(req);

    expect(res?.status).toBe(200);
    expect(res?.headers.get('location')).toBeNull();
  });
});

// Feature: cms-architecture, Property 1
import * as fc from 'fast-check';

describe('Property 1: Session refresh on every protected request', () => {
  // Validates: Requirements 1.4, 2.1

  const createRequest = (path: string) => {
    const url = new URL(`http://localhost:3000${path}`);
    return new NextRequest(url);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getUser exactly once per request for /dashboard/* paths (admin user)', async () => {
    const { createServerClient } = await import('@supabase/ssr');

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (suffix) => {
          vi.clearAllMocks();
          const getUserMock = vi.fn().mockResolvedValue({ data: { user: { id: 'admin-user' } } });
          const supabaseMock = {
            auth: { getUser: getUserMock },
            from: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
            }),
          };
          (createServerClient as any).mockReturnValue(supabaseMock);

          const path = `/dashboard/${suffix}`;
          const req = createRequest(path);
          const res = await middleware(req);

          expect(getUserMock).toHaveBeenCalledTimes(1);
          expect(res?.status).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('calls getUser exactly once per request for /resources/* paths (admin user)', async () => {
    const { createServerClient } = await import('@supabase/ssr');

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (suffix) => {
          vi.clearAllMocks();
          const getUserMock = vi.fn().mockResolvedValue({ data: { user: { id: 'admin-user' } } });
          const supabaseMock = {
            auth: { getUser: getUserMock },
            from: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
            }),
          };
          (createServerClient as any).mockReturnValue(supabaseMock);

          const path = `/resources/${suffix}`;
          const req = createRequest(path);
          const res = await middleware(req);

          expect(getUserMock).toHaveBeenCalledTimes(1);
          expect(res?.status).toBe(200);
        }
      ),
      { numRuns: 100 }
    );
  });
});
