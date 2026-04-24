# Requirements Document

## Introduction

This document defines the requirements for a robust CMS (Content Management System) architecture built on Next.js, deployed to Vercel, using Supabase for authentication and relational data, MongoDB Atlas for flexible document storage, and Amazon S3 (via Supabase Storage S3-compatible API) for media and asset management.

The existing codebase already has foundational pieces in place: Supabase auth with an OAuth callback, a blog CRUD API backed by Supabase, a presigned-URL route for S3 uploads, Google Drive file listing, analytics event tracking, and a role-gated dashboard. This spec formalises and extends those foundations into a coherent, production-ready CMS architecture.

---

## Glossary

- **CMS**: Content Management System — the full application described in this document.
- **Dashboard**: The admin-only area at `/dashboard` used to manage content, media, and settings.
- **API_Layer**: The set of Next.js API Route Handlers under `app/api/`.
- **Auth_Service**: Supabase Auth, responsible for user identity, session management, and OAuth flows.
- **Supabase_DB**: The PostgreSQL database hosted on Supabase, used for structured relational data (blogs, profiles, analytics events).
- **MongoDB_Atlas**: The MongoDB Atlas cluster used for flexible document storage (e.g., rich content, metadata, drive-linked resources).
- **S3_Storage**: The Amazon S3-compatible storage layer (Supabase Storage S3 API) used for media and asset uploads.
- **Middleware**: The Next.js Edge Middleware (`src/middleware.ts`) that enforces authentication and role-based access on protected routes.
- **Admin_User**: A user whose `profiles.role` is `admin` or `super_user` in Supabase_DB.
- **Content_Item**: A blog post or any other managed content entity stored in Supabase_DB or MongoDB_Atlas.
- **Media_Asset**: An image, video, document, or other binary file stored in S3_Storage.
- **Presigned_URL**: A time-limited, signed URL that authorises a client to upload directly to S3_Storage without exposing credentials.
- **Analytics_Event**: A structured record of a user interaction (page view, click, etc.) stored in Supabase_DB.
- **Session**: A Supabase Auth session represented by a JWT stored in an HTTP-only cookie.
- **Slug**: A URL-safe, unique string identifier for a Content_Item.
- **RLS**: Row-Level Security — Supabase_DB policies that restrict data access per authenticated user.
- **Connection_Pool**: A managed pool of database connections used to avoid exhausting Supabase_DB connection limits under Vercel's serverless concurrency.

---

## Requirements

### Requirement 1: Supabase Authentication and Session Management

**User Story:** As an Admin_User, I want to sign in via OAuth (Google) and have my session securely maintained across all dashboard pages, so that I can manage content without re-authenticating on every request.

#### Acceptance Criteria

1. WHEN a user initiates an OAuth sign-in, THE Auth_Service SHALL redirect the user to the provider and, upon success, exchange the authorisation code for a Session via the `/auth/callback` route.
2. WHEN the OAuth code exchange succeeds, THE Auth_Service SHALL store the Session in an HTTP-only, `SameSite=Lax` cookie and redirect the user to the originally requested path.
3. IF the OAuth code exchange fails or no code is present, THEN THE Auth_Service SHALL redirect the user to `/auth/auth-error`.
4. WHILE a Session cookie is present, THE Middleware SHALL refresh the Session token on every request to protected routes to prevent expiry during active use.
5. WHEN a user signs out, THE Auth_Service SHALL invalidate the Session and clear all auth cookies within 1 second.
6. THE Auth_Service SHALL expose a `createClient` factory for server components and a separate `createBrowserClient` factory for client components, so that each context uses the correct cookie-handling strategy.

---

### Requirement 2: Role-Based Access Control via Middleware

**User Story:** As a system operator, I want all dashboard and protected routes to be gated by role checks, so that only Admin_Users can access the CMS management interface.

#### Acceptance Criteria

1. WHEN a request arrives at any route matching `/dashboard/:path*` or `/resources/:path*`, THE Middleware SHALL verify the Session before allowing the request to proceed.
2. IF no valid Session exists for a protected route request, THEN THE Middleware SHALL redirect the user to `/` with `?login=true&redirect=<original_path>` query parameters.
3. WHEN a valid Session exists, THE Middleware SHALL query the `profiles` table in Supabase_DB to retrieve the user's `role`.
4. IF the authenticated user's `role` is neither `admin` nor `super_user`, THEN THE Middleware SHALL redirect the user to `/` and SHALL NOT expose any dashboard content.
5. THE Middleware SHALL log all unauthorised access attempts with the request path and anonymised IP address.
6. THE Middleware SHALL complete its role check within 500ms to avoid Vercel Edge timeout limits.

---

### Requirement 3: Blog Content Management API

**User Story:** As an Admin_User, I want a complete CRUD API for blog posts, so that I can create, read, update, and delete content from the dashboard.

#### Acceptance Criteria

1. WHEN a `GET /api/blog` request is received, THE API_Layer SHALL return all blog posts ordered by `created_at` descending from Supabase_DB.
2. WHEN a `POST /api/blog` request is received with a valid authenticated Session, THE API_Layer SHALL insert a new Content_Item into Supabase_DB, setting `author_name` from the authenticated user's profile metadata.
3. IF a `POST /api/blog` request is received without a valid Session, THEN THE API_Layer SHALL return HTTP 401.
4. WHEN a `PATCH /api/blog/:id` request is received, THE API_Layer SHALL update the specified Content_Item in Supabase_DB and set `updated_at` to the current timestamp.
5. WHEN a `DELETE /api/blog/:id` request is received, THE API_Layer SHALL permanently remove the specified Content_Item from Supabase_DB.
6. IF a `PATCH` or `DELETE` request targets a Content_Item that does not exist, THEN THE API_Layer SHALL return HTTP 404.
7. THE API_Layer SHALL enforce that each Content_Item has a unique `slug`; IF a duplicate slug is submitted, THEN THE API_Layer SHALL return HTTP 409 with a descriptive error message.
8. WHEN a Content_Item is published (i.e., `published_at` is set), THE API_Layer SHALL validate that `title`, `slug`, and `content` fields are non-empty before persisting.

---

### Requirement 4: Public Blog Rendering

**User Story:** As a site visitor, I want to browse and read published blog posts, so that I can consume content without needing an account.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog`, THE CMS SHALL display only Content_Items where `published_at` is non-null and less than or equal to the current timestamp.
2. WHEN a visitor navigates to `/blog/:slug`, THE CMS SHALL retrieve and render the Content_Item matching the given Slug.
3. IF no Content_Item matches the requested Slug, THEN THE CMS SHALL render a 404 page.
4. THE CMS SHALL display the `author_name`, `published_at` date, and estimated reading time (calculated as `ceil(content.length / 1000)` minutes) on each blog post page.
5. WHERE a `thumbnail_url` is present on a Content_Item, THE CMS SHALL render the thumbnail image in the post listing and post detail views.

---

### Requirement 5: Media Asset Management via S3 Storage

**User Story:** As an Admin_User, I want to upload images and files directly to S3_Storage from the dashboard, so that I can attach media to content without routing large files through the server.

#### Acceptance Criteria

1. WHEN a `POST /api/storage/presigned-url` request is received with `filename`, `contentType`, and `bucketName` fields, THE API_Layer SHALL generate a Presigned_URL for a `PutObject` operation that expires in 60 seconds.
2. IF any of `filename`, `contentType`, or `bucketName` are missing from the request, THEN THE API_Layer SHALL return HTTP 400 with a message listing the missing fields.
3. WHEN a Presigned_URL is issued, THE S3_Storage SHALL accept a direct `PUT` upload from the client browser without requiring server-side proxying of the file data.
4. THE API_Layer SHALL initialise the S3 client using `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_S3_REGION`, and `SUPABASE_S3_ENDPOINT` environment variables, with `forcePathStyle: true` for Supabase S3 compatibility.
5. IF the S3 client cannot be initialised due to missing credentials, THEN THE API_Layer SHALL return HTTP 500 and log the configuration error server-side without exposing credentials in the response.
6. WHERE an Admin_User uploads a Media_Asset, THE CMS SHALL store the resulting S3 object URL and associate it with the relevant Content_Item as `thumbnail_url` or within `metadata`.

---

### Requirement 6: MongoDB Atlas Integration for Document Storage

**User Story:** As a developer, I want MongoDB Atlas connected as a secondary data store, so that flexible, schema-less document data (rich content blocks, drive-linked resources, extended metadata) can be stored and queried independently of the relational Supabase_DB.

#### Acceptance Criteria

1. THE CMS SHALL establish a MongoDB Atlas connection using a `MONGODB_URI` environment variable at application startup.
2. WHEN the MongoDB Atlas connection is established, THE CMS SHALL use a singleton connection pool to avoid exhausting Atlas connection limits under Vercel's serverless concurrency model.
3. IF the MongoDB Atlas connection fails on startup, THEN THE CMS SHALL log the error with a descriptive message and SHALL NOT crash the Next.js server process.
4. THE API_Layer SHALL expose a `lib/mongodb.ts` utility that exports a `connectToDatabase` function returning a cached `MongoClient` instance.
5. WHEN a `connectToDatabase` call is made, THE CMS SHALL reuse an existing cached connection if one is available, and SHALL only open a new connection if none exists.
6. FOR ALL calls to `connectToDatabase`, calling the function twice in the same process SHALL return the same `MongoClient` instance (idempotence property).

---

### Requirement 7: Analytics Event Tracking

**User Story:** As an Admin_User, I want page view and interaction events to be tracked and queryable, so that I can understand how visitors engage with the site.

#### Acceptance Criteria

1. WHEN a `POST /api/analytics/track` request is received with `event_name`, `path`, and `session_id` fields, THE API_Layer SHALL insert an Analytics_Event record into the `analytics_events` table in Supabase_DB.
2. THE API_Layer SHALL record `user_id` from the authenticated Session if present, and SHALL store `null` for anonymous visitors.
3. WHEN a `GET /api/analytics/stats` request is received with a `range` query parameter (`24h`, `7d`, or `30d`), THE API_Layer SHALL return `totalViews`, `uniqueVisitors`, `topPages`, and `chartData` aggregated over the specified time range.
4. IF the `range` parameter is absent or invalid, THEN THE API_Layer SHALL default to the `7d` range.
5. THE API_Layer SHALL calculate `uniqueVisitors` by counting distinct `session_id` values within the time range.
6. THE API_Layer SHALL return analytics stats within 2 seconds for datasets up to 100,000 Analytics_Event records.

---

### Requirement 8: Google Drive File Integration

**User Story:** As an Admin_User, I want to browse files from a configured Google Drive folder, so that I can reference or link drive-hosted assets within CMS content.

#### Acceptance Criteria

1. WHEN a `GET /api/drive/files` request is received, THE API_Layer SHALL list files from the Google Drive folder specified by `GOOGLE_DRIVE_FOLDER_ID` or the `?folderId` query parameter.
2. WHERE OAuth tokens are present in the request, THE API_Layer SHALL authenticate with Google Drive using those tokens.
3. IF OAuth tokens are absent but `GOOGLE_API_KEY` is set, THEN THE API_Layer SHALL fall back to API key authentication for public folder access.
4. IF neither OAuth tokens nor `GOOGLE_API_KEY` are available, THEN THE API_Layer SHALL return HTTP 401.
5. THE API_Layer SHALL return file metadata including `id`, `name`, `mimeType`, `webViewLink`, `iconLink`, `modifiedTime`, and `size` for up to 50 files ordered by `modifiedTime` descending.
6. IF the Google Drive API returns an error, THEN THE API_Layer SHALL return HTTP 500 with the upstream error message.

---

### Requirement 9: Environment Configuration and Secret Management

**User Story:** As a developer, I want all service credentials and configuration values to be managed via environment variables, so that secrets are never committed to source control and the application can be configured per environment.

#### Acceptance Criteria

1. THE CMS SHALL read all service credentials exclusively from environment variables and SHALL NOT hardcode any credentials in source files.
2. THE CMS SHALL require the following environment variables to be set for full functionality: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY`, `SUPABASE_S3_REGION`, `SUPABASE_S3_ENDPOINT`, `MONGODB_URI`, `GOOGLE_API_KEY`, `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
3. WHERE an environment variable is missing at runtime, THE CMS SHALL log a descriptive warning identifying the missing variable and SHALL degrade gracefully by disabling only the affected feature.
4. THE CMS SHALL provide an `.env.example` file listing all required variables with placeholder values and inline comments describing each variable's purpose.
5. WHEN deployed to Vercel, THE CMS SHALL read environment variables from Vercel's encrypted environment variable store and SHALL NOT require a `.env` file to be present in the deployment artifact.

---

### Requirement 10: Vercel Deployment and Health Monitoring

**User Story:** As a developer, I want the CMS to be deployable to Vercel with zero-downtime and to expose a health check endpoint, so that deployment pipelines and uptime monitors can verify the application is running correctly.

#### Acceptance Criteria

1. THE CMS SHALL expose a `GET /api/health` endpoint that returns HTTP 200 with `{ "status": "ok" }` when the application is running.
2. WHEN deployed to Vercel, THE CMS SHALL function correctly as a serverless Next.js application with all API routes executing as Vercel Serverless Functions.
3. THE CMS SHALL include a `next.config` that does not break Vercel's build pipeline and supports the App Router.
4. WHEN a Vercel deployment is triggered, THE CMS SHALL complete a production build without TypeScript or ESLint errors.
5. THE API_Layer SHALL handle cold-start latency by using singleton patterns for database clients (Supabase, MongoDB Atlas, S3) so that connections are reused across invocations within the same function instance.

---

### Requirement 11: Supabase Database Schema and Row-Level Security

**User Story:** As a developer, I want the Supabase_DB schema to be well-defined with RLS policies, so that data access is secure by default and each table enforces appropriate read/write permissions.

#### Acceptance Criteria

1. THE Supabase_DB SHALL contain a `blogs` table with columns: `id` (UUID, primary key), `title` (text, not null), `slug` (text, unique, not null), `content` (text), `thumbnail_url` (text), `author_name` (text), `metadata` (jsonb), `created_at` (timestamptz, default now()), `updated_at` (timestamptz), `published_at` (timestamptz).
2. THE Supabase_DB SHALL contain a `profiles` table with columns: `id` (UUID, references `auth.users`), `role` (text, default `user`), `created_at` (timestamptz).
3. THE Supabase_DB SHALL contain an `analytics_events` table with columns: `id` (UUID, primary key), `event_name` (text), `path` (text), `session_id` (text), `user_id` (UUID, nullable), `user_agent` (text), `referrer` (text), `metadata` (jsonb), `created_at` (timestamptz, default now()).
4. THE Supabase_DB SHALL enable RLS on the `blogs` table such that anonymous users can read published rows and only Admin_Users can insert, update, or delete rows.
5. THE Supabase_DB SHALL enable RLS on the `profiles` table such that each user can read and update only their own profile row.
6. THE Supabase_DB SHALL enable RLS on the `analytics_events` table such that any authenticated or anonymous client can insert rows, but only Admin_Users can read aggregated data.
