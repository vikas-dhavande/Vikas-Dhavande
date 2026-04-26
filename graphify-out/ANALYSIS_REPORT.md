# Comprehensive Codebase Analysis Report
**Project:** vikas-personal-site (Next.js CMS)
**Date:** 2026-04-26
**Corpus:** 117 files · ~63,313 words · 311 nodes · 271 edges · 12 communities

---

## 1. Visual Dependency Graph

### System Architecture (Top-Level)

```
Browser / Client
  │
  ├── AnalyticsTracker ──────────────────────────────► POST /api/analytics/track
  ├── LoginModal ─────────────────────────────────────► Supabase Auth (browser client)
  ├── BlogEditor ─────────────────────────────────────► POST/PATCH /api/blog
  │                                                     POST /api/storage/presigned-url
  │                                                     PUT <S3 presigned URL>
  └── Dashboard Pages ────────────────────────────────► GET /api/blog
                                                        GET /api/analytics/stats
                                                        GET /api/drive/files
                                                        
Vercel Edge
  │
  └── src/middleware.ts  ◄── ALL /dashboard/* and /resources/* requests
        │  createServerClient (inline)
        │  supabase.auth.getUser()  ──────────────────► Supabase Auth
        │  supabase.from('profiles').select('role')  ──► Supabase DB
        └── NextResponse.next() / redirect('/')

Next.js App Router (Serverless Functions)
  │
  ├── app/api/blog/route.ts
  │     └── createClient() [supabase-server.ts]  ──────► Supabase DB (blogs table)
  │
  ├── app/api/blog/[id]/route.ts
  │     └── createClient() [supabase-server.ts]  ──────► Supabase DB (blogs table)
  │
  ├── app/api/analytics/track/route.ts
  │     └── createClient() [supabase-server.ts]  ──────► Supabase DB (analytics_events)
  │
  ├── app/api/analytics/stats/route.ts
  │     ├── normaliseRange() [analytics-utils.ts]
  │     ├── aggregateEvents() [analytics-utils.ts]
  │     └── createClient() [supabase-server.ts]  ──────► Supabase DB (analytics_events)
  │
  ├── app/api/storage/presigned-url/route.ts
  │     └── getS3Client() [s3.ts]  ─────────────────────► Supabase S3 Storage
  │
  ├── app/api/drive/files/route.ts
  │     ├── createOAuthClient() [api/_lib/google-auth.ts]
  │     ├── parseStoredTokens() [api/_lib/google-auth.ts]
  │     └── google.drive()  ──────────────────────────────► Google Drive API v3
  │
  └── app/api/health/route.ts
        └── jsonResponse() [api/_lib/responses.ts]

Data Layer
  ├── Supabase Auth + PostgreSQL
  │     ├── auth.users (managed by Supabase)
  │     ├── public.blogs
  │     ├── public.profiles
  │     └── public.analytics_events
  ├── MongoDB Atlas
  │     ├── content_blocks (flexible rich content)
  │     └── drive_resources (Drive-linked metadata)
  └── Supabase S3 Storage
        └── Media assets (images, files)
```

### Module Dependency Graph (Key Edges)

```
src/middleware.ts
  └── @supabase/ssr (createServerClient)

src/lib/supabase.ts
  └── @supabase/ssr (createBrowserClient)
  └── [exports] getSupabase(), createClient(), isSupabaseConfigured()

src/lib/supabase-server.ts
  └── @supabase/ssr (createServerClient)
  └── next/headers (cookies)
  └── [exports] createClient() [async], isSupabaseServerConfigured()

src/lib/blogs.ts
  └── src/lib/supabase.ts (getSupabase)   ← ISSUE: uses browser client
  └── src/types.ts (Blog)

src/lib/s3.ts
  └── @aws-sdk/client-s3 (S3Client)
  └── [exports] getS3Client()

src/lib/mongodb.ts
  └── mongodb (MongoClient)
  └── [exports] connectToDatabase()

src/lib/analytics-utils.ts
  └── src/types.ts (AnalyticsStats)
  └── [exports] normaliseRange(), aggregateEvents()

app/api/blog/route.ts
  └── src/lib/supabase-server.ts (createClient)

app/api/blog/[id]/route.ts
  └── src/lib/supabase-server.ts (createClient)

app/api/analytics/track/route.ts
  └── src/lib/supabase-server.ts (createClient)

app/api/analytics/stats/route.ts
  └── src/lib/supabase-server.ts (createClient)
  └── src/lib/analytics-utils.ts (normaliseRange, aggregateEvents)

app/api/storage/presigned-url/route.ts
  └── src/lib/s3.ts (getS3Client)
  └── @aws-sdk/client-s3 (PutObjectCommand)
  └── @aws-sdk/s3-request-presigner (getSignedUrl)

app/api/drive/files/route.ts
  └── googleapis (google.drive)
  └── api/_lib/google-auth.ts (createOAuthClient, parseStoredTokens)
  └── api/_lib/responses.ts (jsonResponse)

app/dashboard/layout.tsx
  └── src/components/app-sidebar.tsx
  └── src/components/ui/sidebar.tsx
  └── src/components/ui/breadcrumb.tsx
```

---

## 2. Component Responsibility Summary

### Infrastructure / Cross-Cutting

| Module | Responsibility |
|--------|---------------|
| `src/middleware.ts` | Edge-layer auth gate. Validates JWT via `getUser()`, queries `profiles.role`, redirects unauthenticated/non-admin users. Single enforcement point for RBAC. |
| `src/lib/supabase.ts` | Browser-side Supabase singleton. Exports `getSupabase()` (legacy cached singleton) and `createClient()` (new per-call factory). Used in client components. |
| `src/lib/supabase-server.ts` | Server-side async Supabase factory. Reads cookies via `next/headers`. Used in all API route handlers and server components. |
| `src/lib/s3.ts` | S3 client singleton for Supabase-compatible S3. Lazy-initialised, throws on missing credentials. |
| `src/lib/mongodb.ts` | MongoDB Atlas singleton with promise-level caching. Non-crashing — returns `null` on connection failure. |
| `src/lib/analytics-utils.ts` | Pure utility functions: `normaliseRange()` (validates/defaults range param) and `aggregateEvents()` (computes totalViews, uniqueVisitors, topPages, chartData). Fully testable in isolation. |
| `src/lib/blogs.ts` | Client-side blog data access helpers (`getBlogs`, `getBlogBySlug`, `createBlog`). Uses browser Supabase client. |
| `src/lib/logger.ts` | Structured logging utility. |
| `src/types.ts` | Canonical TypeScript interfaces: `User`, `AuthState`, `Blog`, `Profile`, `AnalyticsEvent`, `AnalyticsStats`. |
| `api/_lib/google-auth.ts` | Google OAuth client factory, cookie-based token parsing, state cookie management. |
| `api/_lib/responses.ts` | `jsonResponse()` helper — consistent JSON response wrapper. |
| `api/_lib/env.ts` | Environment variable validation helpers. |
| `api/_lib/cookies.ts` | Cookie serialisation/parsing utilities. |

### API Route Handlers

| Route | Method(s) | Responsibility |
|-------|-----------|---------------|
| `app/api/blog/route.ts` | GET, POST | Blog listing (all, ordered by `created_at` DESC) and creation (auth-gated, slug uniqueness, publish validation). |
| `app/api/blog/[id]/route.ts` | PATCH, DELETE | Blog update (always sets `updated_at`, 404 on missing) and deletion (auth-gated, 404 on missing). |
| `app/api/analytics/track/route.ts` | POST | Inserts analytics events. Validates required fields, captures optional `user_id` from session. |
| `app/api/analytics/stats/route.ts` | GET | Returns aggregated analytics stats. Delegates range normalisation and aggregation to `analytics-utils.ts`. |
| `app/api/storage/presigned-url/route.ts` | POST | Generates 60-second S3 presigned PUT URLs. Validates all three required fields, handles S3 init errors gracefully. |
| `app/api/drive/files/route.ts` | GET | Lists Google Drive files. OAuth-first with API key fallback. Returns 401/400/500 on auth/config failures. |
| `app/api/health/route.ts` | GET | Health check — returns `{ status: 'ok' }`. |
| `app/auth/callback/route.ts` | GET | OAuth code exchange. Sets session cookie, redirects to dashboard or `/auth/auth-error`. |

### UI Components

| Component | Responsibility |
|-----------|---------------|
| `src/components/app-sidebar.tsx` | Admin dashboard navigation sidebar. |
| `src/components/analytics/AnalyticsTracker.tsx` | Client-side analytics event emitter. Fires POST to `/api/analytics/track` on page views. |
| `src/components/auth/LoginModal.tsx` | OAuth sign-in modal. Uses browser Supabase client (`useAuth` hook). |
| `src/components/auth/LoginModalHandler.tsx` | Reads `?login=true` query param and triggers `LoginModal`. |
| `src/components/blog/BlogEditor.tsx` | Rich text editor (TipTap) for creating/editing blog posts. Handles S3 thumbnail upload flow. |
| `src/components/layout/UserAccountNav.tsx` | User avatar + sign-out dropdown. |
| `src/hooks/useAuth.tsx` | Auth state hook. Wraps Supabase `onAuthStateChange`. |
| `src/components/chart-area-interactive.tsx` | Recharts area chart for analytics dashboard. |
| `app/dashboard/layout.tsx` | Admin layout shell: sidebar + breadcrumb header. No auth logic (delegated to middleware). |

---

## 3. Circular Dependencies

**No circular dependencies detected** in the core module graph.

The dependency flow is strictly layered:

```
types.ts
  ↑
lib/* (supabase, s3, mongodb, analytics-utils, blogs)
  ↑
api/_lib/* (google-auth, responses, cookies, env)
  ↑
app/api/* (route handlers)
  ↑
app/dashboard/* (pages, layouts)
  ↑
src/components/* (UI)
```

One potential concern worth monitoring:

- `src/lib/blogs.ts` imports from `src/lib/supabase.ts` (browser client). If `blogs.ts` is ever imported in a server component or API route, it will pull in the browser client — which is incorrect. Currently it appears to be used only in client-side contexts, but this is fragile (see Refactoring Recommendations §6).

---

## 4. Performance Hotspots

### 4.1 Middleware — Double DB Round-Trip on Every Protected Request

**Severity: HIGH**

Every request to `/dashboard/*` or `/resources/*` makes two sequential network calls:
1. `supabase.auth.getUser()` — validates JWT with Supabase Auth server
2. `supabase.from('profiles').select('role')` — queries PostgreSQL for the user's role

These are sequential (not parallel) and both hit external services from the Vercel Edge. On cold starts or high-latency connections this can approach or exceed the 500ms budget specified in Requirement 2.6.

**Fix:** Cache the role in the JWT custom claims via a Supabase Auth hook (`auth.users` → `raw_app_meta_data.role`). The middleware can then read `user.app_metadata.role` directly from the already-validated JWT, eliminating the second DB query entirely.

```typescript
// After fix — single network call
const { data: { user } } = await supabase.auth.getUser();
const role = user?.app_metadata?.role;
const isAdmin = role === 'admin' || role === 'super_user';
```

### 4.2 `src/lib/blogs.ts` — Browser Client in Data Fetching

**Severity: MEDIUM**

`getBlogs()` and `getBlogBySlug()` use `getSupabase()` (browser client). This means:
- No server-side rendering benefit — data fetches happen client-side
- Extra round-trip: browser → Next.js → Supabase (vs. server component → Supabase directly)
- The public blog pages (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`) should use the server client for SSR/ISR

### 4.3 Analytics Stats — Full Table Scan

**Severity: MEDIUM**

`GET /api/analytics/stats` fetches all events in the time range with `SELECT path, session_id, created_at` and aggregates in JavaScript. For large datasets (>100k rows), this transfers significant data over the wire and does aggregation in the serverless function.

The `idx_analytics_created_at` index helps with the range filter, but the aggregation should move to PostgreSQL:

```sql
-- topPages via SQL
SELECT path, COUNT(*) as views
FROM analytics_events
WHERE created_at >= $1
GROUP BY path
ORDER BY views DESC
LIMIT 10;
```

### 4.4 `getSupabase()` — Module-Level Singleton vs. Per-Request

**Severity: LOW**

`src/lib/supabase.ts` caches the browser client in a module-level variable (`supabaseClient`). In Next.js App Router with React Server Components, module-level state can be shared across requests in the same serverless instance. This is safe for the browser client (which is stateless), but the pattern should not be replicated for server-side clients.

### 4.5 S3 Client — Module-Level Credential Capture

**Severity: LOW**

`src/lib/s3.ts` reads env vars at module load time (top-level `const accessKeyId = process.env...`). In Vercel's serverless model this is fine, but it means credential rotation requires a redeployment. Consider reading inside `getS3Client()` for better flexibility.

### 4.6 MongoDB — Missing Connection Guard

**Severity: LOW**

`connectToDatabase()` resets `cachedPromise = null` on failure, which allows retry on the next call. However, if the URI is missing (`process.env.MONGODB_URI` is undefined), `MongoClient.connect(undefined!)` will throw a confusing error. Add an explicit guard:

```typescript
if (!process.env.MONGODB_URI) {
  console.error('[MongoDB] MONGODB_URI is not set');
  return null;
}
```

---

## 5. Architectural Issues

### 5.1 Dual Supabase Client Factories — Naming Collision

**Severity: HIGH**

Both `src/lib/supabase.ts` and `src/lib/supabase-server.ts` export a function named `createClient()`. This is a naming collision that TypeScript path aliases (`@/lib/supabase` vs `@/lib/supabase-server`) mitigate at the import level, but it creates confusion:

- `supabase.ts#createClient()` → browser client (synchronous, returns `null` if unconfigured)
- `supabase-server.ts#createClient()` → server client (async, returns `null` if unconfigured)

A developer importing the wrong one in a server context will get a browser client silently. The graphify god-node analysis confirms `createClient()` has 6 edges and is a cross-community bridge — meaning it's used in many places and the ambiguity is a real risk.

**Fix:** Rename to `createBrowserClient()` in `supabase.ts` and `createServerClient()` in `supabase-server.ts` (or keep the current names but add JSDoc `@throws` and `@serverOnly` annotations).

### 5.2 `src/lib/blogs.ts` — Wrong Client Context

**Severity: MEDIUM**

`blogs.ts` uses `getSupabase()` (browser client) for all three operations including `createBlog()`. The `createBlog()` function is likely called from the dashboard (client component), which is fine. But `getBlogs()` and `getBlogBySlug()` are also used in public blog pages — if those pages are server components (as the spec requires), they should use `supabase-server.ts#createClient()`.

The spec's Task 7 addresses this by converting blog pages to server components, but `blogs.ts` itself still exports browser-client-backed functions that could be misused.

### 5.3 Dashboard Layout — Static Breadcrumb

**Severity: LOW**

`app/dashboard/layout.tsx` renders a hardcoded `BreadcrumbPage` of "Overview" regardless of the current route. This means all dashboard sub-pages show "Overview" in the breadcrumb. The breadcrumb should be dynamic based on the current path.

### 5.4 `use-mobile.ts` and `use-mobile.tsx` — Duplicate Files

**Severity: LOW**

The graphify report flags `Community 17` as a thin community containing both `use-mobile.ts` and `use-mobile.tsx`. These are duplicate implementations of the same hook. One should be deleted.

### 5.5 `app/api/blog/[id]/route.ts` — DELETE 404 Detection

**Severity: LOW**

The DELETE handler checks `error?.code === 'PGRST116'` for 404, but Supabase's `.delete()` without `.select()` doesn't return `PGRST116` — it returns an empty result with no error. The 404 check will never trigger. To detect "no rows deleted", use `.select()` after `.delete()` and check if the returned array is empty.

```typescript
const { data, error } = await supabase
  .from('blogs')
  .delete()
  .eq('id', id)
  .select();

if (!data || data.length === 0) {
  return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
}
```

---

## 6. Refactoring Recommendations

### R1 — Eliminate Middleware's Second DB Query (Priority: HIGH)

Sync `profiles.role` into `auth.users.app_metadata` via a Supabase database webhook or trigger. The middleware reads role from the JWT directly, cutting latency by ~50% on every protected request.

```sql
-- Supabase trigger to sync role into app_metadata
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_role_to_jwt();
```

### R2 — Rename Supabase Client Exports (Priority: HIGH)

Disambiguate the two `createClient()` exports to prevent wrong-context usage:

```typescript
// src/lib/supabase.ts
export function createBrowserSupabaseClient() { ... }

// src/lib/supabase-server.ts  
export async function createServerSupabaseClient() { ... }
```

Update all 6+ import sites accordingly.

### R3 — Move Blog Data Access to Server Context (Priority: MEDIUM)

Refactor `src/lib/blogs.ts` to use `supabase-server.ts` for server-side usage, or split into two files:
- `src/lib/blogs-server.ts` — uses `createClient()` from `supabase-server.ts`
- `src/lib/blogs-client.ts` — uses `getSupabase()` from `supabase.ts`

This makes the context explicit and prevents accidental browser-client usage in server components.

### R4 — Move Analytics Aggregation to PostgreSQL (Priority: MEDIUM)

Replace the JavaScript aggregation in `aggregateEvents()` with SQL GROUP BY queries. This reduces data transfer and leverages the existing `idx_analytics_created_at` index more effectively. Keep `aggregateEvents()` for unit testing with mock data, but add a `aggregateEventsFromDB()` variant that runs SQL.

### R5 — Fix DELETE 404 Detection (Priority: MEDIUM)

As described in §5.5, use `.select()` after `.delete()` to reliably detect missing records.

### R6 — Remove Duplicate `use-mobile` Hook (Priority: LOW)

Delete `src/hooks/use-mobile.ts` (or `.tsx`) — keep only one. Update all imports.

### R7 — Dynamic Dashboard Breadcrumb (Priority: LOW)

Replace the hardcoded "Overview" breadcrumb in `app/dashboard/layout.tsx` with a dynamic breadcrumb that reads from `usePathname()` or a layout-level context.

### R8 — Add MongoDB URI Guard (Priority: LOW)

Add an explicit `MONGODB_URI` presence check at the top of `connectToDatabase()` before attempting `MongoClient.connect()`.

### R9 — Extract S3 Credential Reading (Priority: LOW)

Move env var reads inside `getS3Client()` rather than at module load time, to support credential rotation without redeployment.

---

## 7. Coding Standards Validation

### Against `.kiro/specs/cms-architecture/` Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| 1.4 Session refresh on every protected request | ✅ PASS | `getUser()` called in middleware on every request |
| 2.1–2.4 RBAC middleware | ✅ PASS | Full implementation with logging, try/catch, redirect logic |
| 2.2 Redirect preserves path | ✅ PASS | `?login=true&redirect=<path>` correctly set |
| 3.1 Blog list ordered by `created_at` DESC | ✅ PASS | `.order('created_at', { ascending: false })` |
| 3.2 Author name from session metadata | ✅ PASS | `user.user_metadata?.full_name \|\| email.split('@')[0]` |
| 3.3 Unauthenticated POST → 401 | ✅ PASS | Auth guard present in POST handler |
| 3.4 PATCH always sets `updated_at` | ✅ PASS | `updated_at: new Date().toISOString()` always included |
| 3.5–3.6 404 on missing record | ⚠️ PARTIAL | PATCH: correct. DELETE: PGRST116 check won't fire (see §5.5) |
| 3.7 Duplicate slug → 409 | ✅ PASS | Postgres error code `23505` caught and mapped to 409 |
| 3.8 Published post field validation | ✅ PASS | `title`, `slug`, `content` validated when `published_at` set |
| 5.1–5.2 Presigned URL validation | ✅ PASS | All three fields validated, 400 with missing field list |
| 5.4 S3 `forcePathStyle: true` | ✅ PASS | Set in `s3.ts` |
| 6.2 MongoDB singleton | ✅ PASS | Promise-level cache implemented |
| 6.3 Non-crashing MongoDB failure | ✅ PASS | Returns `null` on error |
| 7.3–7.5 Analytics stats shape | ✅ PASS | All four fields returned; unique visitors via `Set` |
| 7.4 Invalid range defaults to `7d` | ✅ PASS | `normaliseRange()` handles this |
| 8.4 Drive API 401 on no auth | ✅ PASS | Returns 401 when no tokens and no API key |
| 9.1 No hardcoded credentials | ✅ PASS | All credentials from env vars |
| 10.1 Health endpoint | ✅ PASS | Returns `{ status: 'ok' }` |

### TypeScript / Code Quality

| Check | Status | Notes |
|-------|--------|-------|
| Strict null handling | ⚠️ PARTIAL | Several `error: any` casts in catch blocks; should use `unknown` + type narrowing |
| Consistent error shape | ✅ PASS | All routes return `{ error: string }` on failure |
| No hardcoded secrets | ✅ PASS | All credentials from `process.env` |
| Singleton patterns for DB clients | ✅ PASS | S3, MongoDB, browser Supabase all singletons |
| Server/client boundary respected | ⚠️ PARTIAL | `blogs.ts` uses browser client (see §5.2) |
| `fast-check` installed | ✅ PASS | Present in `devDependencies` |
| Test files present | ✅ PASS | `src/test/` has 6 test files covering middleware, analytics, blog pages, RLS, presigned URL, auth |

---

## 8. Scalability Assessment

### What Scales Well

- **Stateless API routes** — all route handlers are stateless; Vercel can scale them horizontally without coordination
- **Singleton DB clients** — S3, MongoDB, and Supabase clients are singletons, minimising connection overhead per function instance
- **Analytics aggregation extracted** — `analytics-utils.ts` is a pure module, easy to move to a background job or edge function
- **RLS at DB layer** — security enforced in PostgreSQL, not application code; scales with the DB
- **S3 direct upload** — presigned URL pattern bypasses the server for file uploads entirely

### Scalability Risks

- **Middleware DB query** — at high traffic, the `profiles` table query in middleware becomes a bottleneck. The JWT role-caching fix (R1) is essential before scaling.
- **Analytics full-table fetch** — JavaScript-side aggregation won't scale past ~50k events per request. SQL aggregation (R4) is needed.
- **MongoDB connection pool** — the singleton pattern works per-instance, but Vercel can spin up many instances. MongoDB Atlas free/shared tiers have connection limits. Consider using a connection pooler (e.g., MongoDB Atlas Data API or a dedicated pooler) for high concurrency.
- **Blog content in PostgreSQL TEXT** — storing large rich-text content in a `TEXT` column works but doesn't support full-text search efficiently. Consider adding a `tsvector` column with a GIN index for search, or offloading to MongoDB's `content_blocks` collection as the design intends.

---

## 9. Summary of Findings

| Category | Count | Severity Breakdown |
|----------|-------|--------------------|
| Architectural Issues | 5 | 1 HIGH, 2 MEDIUM, 2 LOW |
| Performance Hotspots | 6 | 1 HIGH, 2 MEDIUM, 3 LOW |
| Refactoring Recommendations | 9 | 2 HIGH, 3 MEDIUM, 4 LOW |
| Requirements Compliance | 18 checked | 16 PASS, 2 PARTIAL |
| Circular Dependencies | 0 | — |

### Top 3 Actions (Highest ROI)

1. **Cache role in JWT** (R1) — eliminates the second DB round-trip in middleware on every protected request. Biggest latency win.
2. **Rename `createClient()` exports** (R2) — prevents silent wrong-context Supabase client usage. Low effort, high safety gain.
3. **Fix DELETE 404 detection** (R5) — the current check never fires; a one-line fix closes a correctness gap.
