# Implementation Plan: CMS Architecture

## Overview

Incremental implementation of the production-ready CMS architecture. Each task builds on the previous, starting with foundational infrastructure (types, lib utilities, DB schema) and progressing through API routes, public pages, and property-based tests. The existing codebase already has working skeletons for most routes — tasks focus on filling gaps, hardening correctness, and wiring everything together.

All code is TypeScript. Tests use Vitest + fast-check.

## Tasks

- [x] 1. Harden shared TypeScript types and install fast-check
  - Update `src/types.ts` to match the canonical types from the design: add `Profile`, `AnalyticsEvent`, and `AnalyticsStats` interfaces; align `Blog` fields (`updated_at` non-optional, `metadata: Record<string, unknown>`)
  - Install `fast-check` as a dev dependency: `npm install --save-dev fast-check`
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Add MongoDB singleton utility
  - Create `src/lib/mongodb.ts` implementing the promise-level cached singleton (`cachedClient`, `cachedPromise`) as specified in the design
  - `connectToDatabase()` must return `MongoClient | null` — catch connection errors, log them, reset `cachedPromise` to `null` on failure, and return `null` (non-crashing)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 2.1 Write property test for MongoDB singleton idempotence
    - **Property 14: MongoDB connectToDatabase idempotence**
    - For any N ≥ 2 sequential calls to `connectToDatabase()` in the same process, all calls must return the same `MongoClient` instance (reference equality)
    - Use `fc.integer({ min: 2, max: 20 })` to generate N; mock `MongoClient.connect` to return a stable object
    - Tag: `// Feature: cms-architecture, Property 14`
    - **Validates: Requirements 6.2, 6.5, 6.6**

- [x] 3. Create Supabase DB migration file
  - Create `supabase/migrations/001_cms_schema.sql` containing the full schema from the design:
    - `blogs` table with all columns and indexes (`idx_blogs_published_at`, `idx_blogs_slug`)
    - `profiles` table with `handle_new_user` trigger function and `on_auth_user_created` trigger
    - `analytics_events` table with indexes (`idx_analytics_created_at`, `idx_analytics_session_id`)
    - All RLS policies for `blogs`, `profiles`, and `analytics_events` as specified in the design
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 4. Fix Edge Middleware — RBAC and error handling
  - Rewrite `src/middleware.ts` to:
    - Wrap the entire body in `try/catch`; on unexpected error, log and fall through to `NextResponse.next()`
    - On missing session: redirect to `/?login=true&redirect=<original_path>` (encode the path)
    - On session present but role not `admin`/`super_user`: redirect to `/` (no query params)
    - On session present and role is admin/super_user: return `NextResponse.next()` with updated cookie headers
    - Log unauthorised attempts with path and anonymised IP (`x-forwarded-for`)
    - Matcher must cover `/dashboard/:path*` and `/resources/:path*`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 1.4_

  - [ ]* 4.1 Write property test for unauthenticated redirect preserving path
    - **Property 2: Unauthenticated redirect preserves original path**
    - For any path string under `/dashboard/` or `/resources/`, when no session exists, the redirect location must contain `login=true` and `redirect=<original_path>`
    - Use `fc.constantFrom('/dashboard/', '/resources/')` combined with `fc.string()` to generate paths; mock `createServerClient` to return `{ auth: { getUser: () => ({ data: { user: null } }) } }`
    - Tag: `// Feature: cms-architecture, Property 2`
    - **Validates: Requirements 2.2**

  - [ ]* 4.2 Write property test for non-admin role always denied
    - **Property 3: Non-admin role always denied dashboard access**
    - For any role value that is not `admin` or `super_user` (generate with `fc.string()` filtered to exclude those two), an authenticated user must be redirected to `/`
    - Mock `createServerClient` to return a user and a profile with the generated role
    - Tag: `// Feature: cms-architecture, Property 3`
    - **Validates: Requirements 2.4**

- [x] 5. Harden Blog CRUD API routes
  - Update `app/api/blog/route.ts`:
    - `GET`: already orders by `created_at` desc — verify and keep; use `createClient()` from `src/lib/supabase-server.ts` (the async factory) instead of inline `createServerClient`
    - `POST`: add auth guard returning 401 if no user; set `author_name` from `user.user_metadata?.full_name` or email prefix; validate that if `published_at` is set then `title`, `slug`, and `content` are non-empty (return 400 otherwise); handle duplicate slug Postgres error code `23505` → return 409
  - Update `app/api/blog/[id]/route.ts`:
    - `PATCH`: use async `createClient()`; add auth guard; always set `updated_at`; if Supabase returns no rows (`.single()` returns null/error with code `PGRST116`) return 404
    - `DELETE`: use async `createClient()`; add auth guard; return 404 if no rows affected
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 5.1 Write property test for blog list ordering invariant
    - **Property 4: Blog list ordering invariant**
    - For any array of blog objects with distinct `created_at` timestamps, the response array must be in strictly descending `created_at` order (no adjacent pair where earlier appears before later)
    - Use `fc.array(fc.record({ created_at: fc.date() }), { minLength: 2 })` with distinct timestamps; mock Supabase to return the generated array sorted descending; assert ordering holds
    - Tag: `// Feature: cms-architecture, Property 4`
    - **Validates: Requirements 3.1**

  - [ ]* 5.2 Write property test for author name set from session metadata
    - **Property 5: Author name set from session metadata**
    - For any combination of `full_name` (present or absent) and `email`, `author_name` must equal `full_name` if present, otherwise the email prefix before `@`
    - Use `fc.option(fc.string({ minLength: 1 }))` for full_name and `fc.emailAddress()` for email
    - Tag: `// Feature: cms-architecture, Property 5`
    - **Validates: Requirements 3.2**

  - [ ]* 5.3 Write property test for unauthenticated POST always returns 401
    - **Property 6: Unauthenticated POST always returns 401**
    - For any blog payload (any combination of fields), a POST without a session must return 401 and must not call Supabase insert
    - Use `fc.record({ title: fc.string(), slug: fc.string(), content: fc.string() })` for payloads
    - Tag: `// Feature: cms-architecture, Property 6`
    - **Validates: Requirements 3.3**

  - [ ]* 5.4 Write property test for PATCH always updates updated_at
    - **Property 7: PATCH always updates updated_at**
    - For any valid PATCH payload, the resulting record's `updated_at` must be within 5 seconds of the request time
    - Use `fc.record({ title: fc.option(fc.string()), content: fc.option(fc.string()) })` for payloads; mock Supabase update to return the payload merged with a fresh `updated_at`
    - Tag: `// Feature: cms-architecture, Property 7`
    - **Validates: Requirements 3.4**

  - [ ]* 5.5 Write property test for duplicate slug returns 409
    - **Property 9: Duplicate slug always returns 409**
    - For any slug string that already exists, POST must return 409 and must not insert a duplicate
    - Use `fc.string({ minLength: 1 })` for slug values; mock Supabase insert to throw a Postgres error with code `23505`
    - Tag: `// Feature: cms-architecture, Property 9`
    - **Validates: Requirements 3.7**

  - [ ]* 5.6 Write property test for published post requires non-empty fields
    - **Property 10: Published post requires non-empty title, slug, and content**
    - For any payload where `published_at` is set but at least one of `title`, `slug`, or `content` is empty/whitespace, the API must reject with 400 and not persist
    - Use `fc.record` with `fc.constantFrom('', '   ')` for the empty fields
    - Tag: `// Feature: cms-architecture, Property 10`
    - **Validates: Requirements 3.8**

- [x] 6. Checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all existing and new tests pass. Ask the user if any failures arise.

- [x] 7. Fix public blog pages to filter published posts server-side
  - Convert `app/blog/page.tsx` from a client component to a Next.js Server Component:
    - Remove `'use client'`, `useState`, `useEffect`
    - Use `createClient()` from `src/lib/supabase-server.ts` to query only published posts (`published_at IS NOT NULL AND published_at <= now()`) ordered by `published_at DESC`
    - Render the blog list directly (no loading skeleton needed for server component)
  - Convert `app/blog/[slug]/page.tsx` from a client component to a Next.js Server Component:
    - Remove `'use client'`, `useState`, `useEffect`, `useParams`
    - Accept `{ params }: { params: { slug: string } }` as props
    - Use `createClient()` to fetch by slug; call `notFound()` from `next/navigation` if no result
    - Display `author_name`, `published_at`, and reading time (`Math.ceil(content.length / 1000)` min)
    - Render `thumbnail_url` image when present
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.1 Write property test for public blog listing only shows published posts
    - **Property 11: Public blog listing only shows published posts**
    - For any mix of blog posts with null, future, and past `published_at` values, only posts with non-null `published_at <= now()` must appear in the listing
    - Use `fc.array(fc.record({ published_at: fc.option(fc.date()) }))` to generate mixed sets; mock the Supabase query and assert the filter
    - Tag: `// Feature: cms-architecture, Property 11`
    - **Validates: Requirements 4.1**

  - [ ]* 7.2 Write property test for reading time calculation
    - **Property 12: Reading time calculation correctness**
    - For any content string of length n, reading time must equal `Math.ceil(n / 1000)` minutes; holds for empty string (0 min), single char (1 min), and arbitrary lengths
    - Extract the reading time formula into a pure function `calculateReadingTime(content: string): number` in `src/lib/utils.ts`; test it with `fc.string()` of arbitrary length
    - Tag: `// Feature: cms-architecture, Property 12`
    - **Validates: Requirements 4.4**

- [x] 8. Harden presigned URL route
  - Update `app/api/storage/presigned-url/route.ts`:
    - Validate all three required fields (`filename`, `contentType`, `bucketName`) before calling S3; return 400 listing which fields are missing
    - Catch S3 client initialisation errors (missing credentials) and return 500 without exposing credential values
    - Confirm `expiresIn: 60` is set on `getSignedUrl`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 8.1 Write property test for presigned URL missing fields returns 400
    - **Property 13: Presigned URL request missing fields returns 400**
    - For any combination of missing required fields (any single field, any pair, or all three absent), the response must be HTTP 400
    - Use `fc.subarray(['filename', 'contentType', 'bucketName'], { minLength: 1 })` to generate the set of missing fields; build a request body omitting those fields
    - Tag: `// Feature: cms-architecture, Property 13`
    - **Validates: Requirements 5.2**

- [x] 9. Harden analytics routes
  - Update `app/api/analytics/track/route.ts`:
    - Validate that `event_name`, `path`, and `session_id` are present; return 400 if missing
    - Keep `user_id` from session if authenticated, `null` for anonymous
  - Rewrite `app/api/analytics/stats/route.ts`:
    - Replace the mocked `topPages` and `chartData` with real aggregations:
      - `topPages`: group events by `path`, count occurrences, return top 10 sorted by count desc
      - `chartData`: group events by calendar day within the range, return `{ name: string, views: number }[]`
    - Normalise invalid/absent `range` to `'7d'` before the date calculation
    - Return the full `AnalyticsStats` shape: `{ totalViews, uniqueVisitors, bounceRate, topPages, chartData }`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 9.1 Write property test for analytics stats response shape
    - **Property 15: Analytics stats response shape for any valid range**
    - For any of the three valid range values (`24h`, `7d`, `30d`), the response must contain `totalViews` (number), `uniqueVisitors` (number), `topPages` (array), and `chartData` (array)
    - Use `fc.constantFrom('24h', '7d', '30d')` for range; mock Supabase to return a fixed event set
    - Tag: `// Feature: cms-architecture, Property 15`
    - **Validates: Requirements 7.3**

  - [ ]* 9.2 Write property test for invalid range defaults to 7d
    - **Property 16: Invalid range defaults to 7d**
    - For any range value that is not `24h`, `7d`, or `30d` (including absent), the stats must be calculated over the 7-day window — same result as `range=7d`
    - Use `fc.string().filter(s => !['24h', '7d', '30d'].includes(s))` for invalid ranges
    - Tag: `// Feature: cms-architecture, Property 16`
    - **Validates: Requirements 7.4**

  - [ ]* 9.3 Write property test for unique visitor count equals distinct session IDs
    - **Property 17: Unique visitor count equals distinct session IDs**
    - For any set of analytics events with a known distribution of `session_id` values, `uniqueVisitors` must equal the count of distinct `session_id` values — not the total event count
    - Use `fc.array(fc.record({ session_id: fc.constantFrom('a', 'b', 'c', 'd') }), { minLength: 1 })` to generate events with known duplicates; assert `uniqueVisitors === new Set(events.map(e => e.session_id)).size`
    - Tag: `// Feature: cms-architecture, Property 17`
    - **Validates: Requirements 7.5**

- [x] 10. Checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all tests pass. Ask the user if any failures arise.

- [x] 11. Verify Google Drive files route
  - Review `app/api/drive/files/route.ts` against requirements:
    - Confirm 401 is returned when neither OAuth tokens nor `GOOGLE_API_KEY` are present (already implemented — verify)
    - Confirm 400 is returned when tokens are absent and no `folderId` is available (already implemented — verify)
    - Confirm file metadata fields match the spec: `id`, `name`, `mimeType`, `webViewLink`, `iconLink`, `modifiedTime`, `size`
    - Add a 500 response with the upstream error message when the Drive API returns an error (currently throws — wrap in the existing catch and return `{ error: message }` with status 500)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 12. Harden health endpoint and verify S3 singleton
  - Update `app/api/health/route.ts` to return `{ status: 'ok' }` (already correct — confirm it uses `jsonResponse` from `api/_lib/responses.ts` and returns HTTP 200)
  - Verify `src/lib/s3.ts` singleton: confirm `forcePathStyle: true` is set, credentials come from the four env vars (`SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_S3_REGION`, `SUPABASE_S3_ENDPOINT`), and missing credentials log a warning without crashing
  - _Requirements: 10.1, 5.4, 5.5_

- [x] 13. Write RLS property-based tests
  - Create `src/test/rls.test.ts` using the Supabase JS client with service-role and anon keys to simulate different user contexts (as described in the design's Testing Strategy section)
  - Each test uses `createClient(url, anonKey)` for anonymous, `createClient(url, serviceRoleKey)` for admin, and `signInWithPassword` for regular users

  - [ ]* 13.1 Write property test for RLS blocks non-admin writes on blogs
    - **Property 18: RLS blocks non-admin writes on blogs**
    - For any authenticated user whose `profiles.role` is not `admin` or `super_user`, any INSERT/UPDATE/DELETE on `blogs` must be rejected by RLS
    - Use `fc.constantFrom('user', 'editor', 'viewer', '', 'random')` for non-admin roles; simulate each role via the Supabase test client
    - Tag: `// Feature: cms-architecture, Property 18`
    - **Validates: Requirements 11.4**

  - [ ]* 13.2 Write property test for RLS profile row isolation
    - **Property 19: RLS profile row isolation**
    - For any two distinct user IDs A and B, user A's client must not be able to SELECT or UPDATE user B's profile row
    - Generate two distinct UUIDs with `fc.uuid()`; simulate each user's client and assert cross-user access is denied
    - Tag: `// Feature: cms-architecture, Property 19`
    - **Validates: Requirements 11.5**

  - [ ]* 13.3 Write property test for analytics events insertable by any client, readable only by admins
    - **Property 20: Analytics events insertable by any client, readable only by admins**
    - For any analytics event payload, any client (authenticated or anonymous) must be able to INSERT; for any non-admin user, SELECT must be denied
    - Use `fc.record({ event_name: fc.string(), path: fc.string(), session_id: fc.uuid() })` for payloads
    - Tag: `// Feature: cms-architecture, Property 20`
    - **Validates: Requirements 11.6**

- [x] 14. Write middleware session-refresh property test
  - Add to `src/test/middleware.test.ts`:

  - [ ]* 14.1 Write property test for session refresh on every protected request
    - **Property 1: Session refresh on every protected request**
    - For any path under `/dashboard/*` or `/resources/*`, when a valid session cookie is present, the middleware must call `supabase.auth.getUser()` (which triggers session refresh) and return a response with updated cookie headers
    - Use `fc.string({ minLength: 1 })` to generate path suffixes; mock `createServerClient` to track `getUser` call count; assert it is called exactly once per request
    - Tag: `// Feature: cms-architecture, Property 1`
    - **Validates: Requirements 1.4, 2.1**

- [x] 15. Update `.env.example`
  - Add missing variables to `.env.example` with inline comments:
    - `SUPABASE_SERVICE_ROLE_KEY=""` — Supabase service role key for server-side admin operations
    - `MONGODB_URI=""` — MongoDB Atlas connection string (e.g. `mongodb+srv://...`)
    - Ensure all 11 required variables from Requirement 9.2 are present with placeholder values and comments describing each variable's purpose
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 16. Final checkpoint — Ensure all tests pass
  - Run `npm test` and confirm all tests pass. Ask the user if any questions or failures arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` with a minimum of 100 iterations (`numRuns: 100`)
- Each property test is tagged with `// Feature: cms-architecture, Property N` for traceability
- RLS tests (task 13) require a live Supabase project with the migration from task 3 applied
- The existing route skeletons are largely correct — most tasks harden edge cases and wire up the canonical lib utilities rather than rewriting from scratch
- Checkpoints at tasks 6, 10, and 16 ensure incremental validation throughout
