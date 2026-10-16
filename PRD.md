# Product Requirements Document (PRD)

# Vikas Developer Platform & Cloud Hub

**Document Status**: Approved / As-Built Baseline & Strategic Roadmap  
**Document Version**: 1.0.0  
**Authors**: Vikas Dhavande & Platform Architecture Team  
**Design Reference**: [DESIGN.md](file:///c:/Users/vikas/OneDrive/Desktop/Vikas/Vikas-Dhavande1/Vikas-dhavande1/DESIGN.md)  
**Last Updated**: October 2026  

---

## 1. Executive Summary & Product Vision

### 1.1 Executive Summary
The **Vikas Developer Platform & Cloud Hub** is a unified, high-performance web platform combining personal brand engineering, cloud resource storage management, a headless-powered blog content management system (CMS), client/server analytics telemetry, and a role-guarded administrative dashboard.

Built on **Next.js (App Router, React 19)**, **Tailwind CSS v4**, **shadcn/ui**, and **Appwrite Cloud Backend-as-a-Service (BaaS)**, the system replaces fragmented services by centralizing developer portfolio showcases, authenticated file storage, rich article publishing, and visitor telemetry into an integrated, dark-mode native web experience.

### 1.2 Core Problem Statement
Modern independent engineers and technical creators typically manage 3–4 disconnected services:
1. A static marketing portfolio (lacking user authentication or interactive backend services).
2. A third-party cloud drive (e.g. Google Drive/Dropbox) with high friction for public asset distribution or gated member resources.
3. An external publishing platform (Medium, Substack, Dev.to) that fragments audience ownership and domain authority.
4. Third-party analytics services that inject heavy scripts, compromise privacy, or lock visitor metrics behind paywalls.

### 1.3 Strategic Solution
The Platform consolidates these needs into a self-hosted, scalable web application providing:
- **Public Brand Presence**: Hardware-accelerated motion components, interactive workspace demos, and dynamic resource catalogs.
- **Unified Cloud File Management**: Direct Appwrite Storage integration for uploading, previewing, and distributing developer assets with search and MIME validation.
- **Autonomous Editorial CMS**: Integrated Tiptap-powered rich text authoring with draft/published workflows, slugs, and instant indexing.
- **Zero-Dependency Telemetry**: First-party event ingestion (`/api/analytics/track`) and aggregation pipeline supporting 24-hour, 7-day, and 30-day analytics visualization.
- **Multi-Tier Identity & Edge Guarding**: Next.js Edge Middleware verifying Appwrite sessions with strict role-based access control (`user`, `admin`, `super_user`).

---

## 2. User Personas & Permissions Matrix

### 2.1 User Personas

| Persona | Description | Needs & Goals | Core Entry Points |
| :--- | :--- | :--- | :--- |
| **Anonymous Visitor** | Developer, client, or recruiter exploring projects and documentation. | Fast page loads, reading technical blogs, discovering tools/videos, and exploring open-source work. | `/`, `/blog`, `/blog/[slug]`, `/sign-in` |
| **Authenticated Member (`user`)** | Registered developer or client with an active account. | Downloading shared developer resources, uploading private files, managing credentials and profile settings. | `/resources`, `/profile` |
| **Platform Administrator (`admin` / `super_user`)** | Platform owner (Vikas) and authorized editors. | Publishing and editing blog posts, managing storage assets, viewing operational metrics, tracking traffic telemetry. | `/dashboard`, `/dashboard/blog/*`, `/dashboard/analytics` |

### 2.2 Permissions Matrix

| Route / Capability | Anonymous Visitor | Authenticated User (`user`) | Admin / Super User (`admin`, `super_user`) |
| :--- | :---: | :---: | :---: |
| View Landing Page & Showcase (`/`) | Full Access | Full Access | Full Access |
| View Published Blog Posts (`/blog`, `/blog/[slug]`) | Full Access | Full Access | Full Access |
| Sign In / Sign Up (`/sign-in`, `/sign-up`) | Full Access | Redirect to Home | Redirect to Dashboard |
| View & Download Storage Resources (`/resources`) | Blocked (Redirect to `/sign-in`) | Full Access | Full Access |
| Upload & Delete Storage Files (`/api/storage/files`) | Blocked (`401 Unauthorized`) | Permitted (Session verified) | Full Access |
| Manage User Profile & Avatars (`/profile`) | Blocked (Redirect to `/sign-in`) | Own Profile Only | Own Profile Only |
| Access Admin Dashboard (`/dashboard`) | Blocked (Redirect to `/sign-in`) | Blocked (Redirect to `/`) | Full Access |
| Create, Edit & Delete Blog Posts (`/dashboard/blog`) | Blocked | Blocked | Full Access |
| View Traffic Analytics & Telemetry (`/dashboard/analytics`) | Blocked | Blocked | Full Access |

---

## 3. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                Client Browser                                     |
|  React 19 | Next.js App Router | Tailwind CSS v4 | Framer Motion | Recharts | UI   |
+------------------------------------------+----------------------------------------+
                                           | HTTP Requests & Cookies
                                           v
+-----------------------------------------------------------------------------------+
|                              Next.js Edge Middleware                             |
|  - Validates `a_session_<projectId>` cookie via Appwrite Client API               |
|  - RBAC: Restricts `/dashboard/*` to users with `admin` / `super_user` labels      |
|  - Redirects unauthenticated traffic to `/sign-in?redirect=<path>`                |
+------------------------------------------+----------------------------------------+
                                           |
                    +----------------------+----------------------+
                    v                                             v
+---------------------------------------+     +---------------------------------------+
|          App Router Pages             |     |           Route Handlers              |
|  - `/` (Hero, Showcase, Demos)        |     |  - `/api/storage/files` (GET/POST/DEL)|
|  - `/blog`, `/blog/[slug]`            |     |  - `/api/storage/presigned-url`       |
|  - `/resources` (Cloud Files)         |     |  - `/api/drive/files` (Legacy Compat) |
|  - `/profile` (Auth & Avatar)         |     |  - `/api/blog` (GET/POST/PUT/DELETE)  |
|  - `/dashboard/*` (Admin Ops)         |     |  - `/api/analytics/*` (Track & Stats) |
+---------------------------------------+     +---------------------------------------+
                    |                                             |
                    +----------------------+----------------------+
                                           | Server API Key & Session SDK
                                           v
+-----------------------------------------------------------------------------------+
|                             Appwrite Cloud (BaaS)                                 |
|  - Account & Auth Service: Email/Password, Google OAuth, GitHub OAuth             |
|  - Storage Service: Bucket `resources` (File binaries, previews, CDN URLs)       |
|  - Databases Service: Collections `blogs`, `analytics_events`, `profiles`         |
+-----------------------------------------------------------------------------------+
```

### 3.1 Tech Stack Table

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.2.4` | Server-Side Rendering (SSR), Server Components, Route Handlers |
| **Language** | TypeScript | `~5.8.2` | End-to-end type safety across client, server, and API payloads |
| **Runtime** | React | `19.0.0` | React Server Components, Actions, Concurrent Features |
| **Styling** | Tailwind CSS v4 | `^4.2.2` | CSS Tokens, modern utility styling, OKLCH/HSL dark system |
| **Design System** | Base UI + Radix UI + Lucide | `^1.4.0` / `^0.546.0` | Accessible primitives, dialogs, dropdowns, sheet drawers |
| **Rich Text** | Tiptap (Headless) | `^3.22.4` | Rich text article creation and formatting engine |
| **Motion & 3D** | Framer Motion + Three.js | `^12.38.0` / `^0.184.0` | Interactive physics, floating hero icons, micro-interactions |
| **Visual Charts** | Recharts | `^3.8.0` | Time-series traffic areas, top-path bar charts, KPI indicators |
| **Backend BaaS** | Appwrite Cloud (`node-appwrite`) | `^30.0.1` / `^29.0.0` | Auth, session cookies, database storage, file bucket |
| **Testing** | Vitest + Playwright + Storybook | `^4.1.4` / `^10.3.5` | Unit testing, browser automation, isolated UI component specs |

---

## 4. Current Core Features & Functional Specifications

### 4.1 Public Landing & Interactive Brand Showcase

#### Description
The root application page (`/`) presents Vikas Dhavande's personal engineering brand, featuring hardware-accelerated visual components adhering to `DESIGN.md`.

#### Key Components
1. **`FloatingIconsHeroDemo` (`src/components/demo-floating-icons.tsx`)**:
   - Floating interactive technology pills and badges (Next.js, React, TypeScript, Appwrite, Docker, AWS).
   - Dynamic motion physics responsive to hover and pointer movement.
2. **`WorkspaceWelcomeDemo` (`src/components/WorkspaceWelcomeDemo.tsx`)**:
   - Interactive terminal/workspace preview showcasing full-stack capabilities.
3. **`VideoList` (`src/components/VideoList.tsx`)**:
   - Curated engineering demonstrations and architecture walkthroughs.
4. **`Testimonials` (`src/components/Testimonials.tsx`)**:
   - Social proof cards with animated entrance transitions.
5. **Global Navigation Header (`src/components/layout/Header.tsx`)**:
   - Sticky blurred header with backdrop filter (`backdrop-blur-md`).
   - Responsive mobile navigation sheet (`Sheet`, `SheetContent`).
   - Dynamic authentication status indicator and user account dropdown (`UserAccountNav`).
   - Dark/Light mode toggle (`next-themes`).

---

### 4.2 Authentication & Identity Management

#### Description
Full user authentication lifecycle implemented via Appwrite Auth (`src/hooks/useAuth.tsx` & `src/components/auth/AuthCard.tsx`).

#### Functional Capabilities
1. **Email & Password Authentication**:
   - User sign-up (`Account.create`) with full name, email, and password (minimum 8 characters).
   - User sign-in (`Account.createEmailPasswordSession`) setting an HTTP-only Appwrite session cookie `a_session_<projectId>`.
   - Error mapping translating raw API exceptions into actionable feedback (e.g., "Incorrect email or password", "An account with this email already exists").
2. **Third-Party OAuth 2.0**:
   - One-click sign-in via Google and GitHub OAuth providers (`Account.createOAuth2Session`).
   - Post-authentication redirect honoring the original request path (e.g. `?redirect=/resources`).
3. **Session Verification & Global State**:
   - `AuthProvider` context broadcasting `isAuthenticated`, `user`, and `loading` states across all client components.
   - User role resolution based on Appwrite user labels:
     - `super_user` -> `'super_user'`
     - `admin` -> `'admin'`
     - Unlabelled -> `'user'`

---

### 4.3 Route Protection & Edge Security Guard

#### Description
Next.js Edge Middleware (`src/middleware.ts`) protects sensitive routes before request processing reaches application renderers.

#### Implementation Logic
1. **Protected Path Matching**:
   - Targets routes matching `/dashboard/:path*`, `/resources/:path*`, `/profile/:path*`.
2. **Session Identification**:
   - Checks cookies for `a_session_<projectId>`, `a_session_<projectId>_legacy`, or `appwrite-session`.
   - Rejects unauthenticated traffic by logging IP address and redirecting to `/sign-in?redirect=<pathname>`.
3. **Session Hydration via Edge Client**:
   - Uses browser-compatible Appwrite Client SDK in Edge environment (`Client().setSession(sessionToken)`).
4. **Role Enforcement**:
   - Allows all authenticated sessions to access `/resources` and `/profile`.
   - Requires `user.labels` to contain either `'admin'` or `'super_user'` for any `/dashboard/*` path.
   - Non-admin authenticated users attempting to access `/dashboard` are redirected to `/`.

---

### 4.4 Cloud Resources & Storage Management (`/resources`)

#### Description
An authenticated developer file repository allowing users to view, search, upload, download, and delete files stored in the Appwrite Storage bucket (`resources`).

#### Functional Specifications
1. **File Retrieval & Search**:
   - `GET /api/storage/files?bucketId=resources&search=<query>`
   - Real-time search query filtering file names.
   - Fallback route `GET /api/drive/files` provides backward compatibility for legacy clients.
2. **File Upload Pipeline**:
   - Multi-format file uploader with drag-and-drop and manual file picker.
   - Uploads binary streams to `POST /api/storage/files` with session validation.
   - Generates persistent Appwrite File IDs, MIME type classification, and size formatting.
3. **File Actions**:
   - Direct download via authenticated Appwrite download endpoint (`/files/:id/download`).
   - Browser view link for inline rendering of PDFs, images, and audio/video files.
   - Delete capability (`DELETE /api/storage/files?fileId=<id>`) with confirmation toast notifications (`sonner`).
4. **Icon Mapping & UI**:
   - Dynamic icon rendering based on MIME prefix:
     - `application/pdf`, `text/*` -> `FileText`, `FileCode`
     - `image/*` -> `FileImage`
     - `video/*` -> `FileVideo`
     - `audio/*` -> `FileAudio`
     - `application/zip`, `tar`, `gzip` -> `FileArchive`
     - `application/vnd.ms-excel`, `spreadsheet` -> `FileSpreadsheet`

---

### 4.5 Blog CMS & Content Publishing System (`/blog` & `/dashboard/blog`)

#### Description
A full-lifecycle publishing pipeline enabling markdown and rich-text authoring, draft staging, slug resolution, and public reading.

#### Functional Specifications
1. **Public Reading Experience**:
   - `/blog`: Responsive grid displaying published articles ordered descending by `published_at`.
   - `/blog/[slug]`: Server-rendered post page loading article body, thumbnail, author name, and publication date.
2. **Editorial Dashboard (`/dashboard/blog`)**:
   - Post table showing title, slug, status (Published badge vs Draft badge), creation date, and action buttons.
   - Post deletion (`DELETE /api/blog/:id`) with immediate UI cache updates.
3. **Rich Text Editor (`BlogEditor.tsx`)**:
   - Built with Tiptap (`@tiptap/react`, `@tiptap/starter-kit`).
   - Action controls: Bold, Italic, Heading 1, Heading 2, Bullet List, Ordered List, Blockquote, Undo, Redo.
4. **Publishing Controls**:
   - Switch component toggling `is_published` status.
   - When published, automatically stamps ISO 8601 `published_at` timestamp.
   - Custom thumbnail image URL assignment and auto-slug generation.

---

### 4.6 Visitor Telemetry & Site Analytics (`/dashboard/analytics`)

#### Description
A lightweight, privacy-respecting client/server analytics engine that captures page impressions and provides visual operational intelligence without third-party tracking cookies.

#### Functional Specifications
1. **Telemetry Ingestion (`POST /api/analytics/track`)**:
   - Ingests payload: `event_name`, `path`, `session_id`, `user_agent`, `referrer`, `metadata`.
   - Validates presence of core fields; writes persistent event to Appwrite `analytics_events` collection.
2. **Data Aggregation Engine (`src/lib/analytics-utils.ts`)**:
   - Time-window normalization supporting `24h`, `7d`, and `30d` queries.
   - Calculates total page views, unique session identifiers, and top 10 visited URLs.
   - Groups impressions by calendar day (`YYYY-MM-DD`) for time-series charting.
3. **Interactive Visual Dashboard (`/dashboard/analytics`)**:
   - Recharts Area Chart displaying daily traffic trajectories with gradient fills.
   - Horizontal/Vertical Bar Charts displaying highest-traffic routes.
   - Quick range selector buttons (`24h`, `7 days`, `30 days`) with dynamic chart re-rendering.

---

### 4.7 User Profile & Account Settings (`/profile`)

#### Description
Self-service identity, security, and preferences management suite for authenticated users, built with Next.js and Appwrite BaaS (Authentication, Storage, and Account Preferences).

#### Functional Specifications
1. **View Profile & Header Summary**:
   - Dynamic avatar display (custom uploaded photo or generative SVG Blobatar with initials fallback).
   - Display name, role tier badge (`user`, `admin`, `super_user`), and primary email.
   - Account creation date formatted as human-readable date (`Member since <Date>`).
   - Email verification status badge: `Verified` (emerald check) or `Unverified` (amber alert).
   - Unverified notice banner with direct "Resend Verification Email" action trigger (`account.createVerification`).

2. **Profile Information & Editing (`Profile` Tab)**:
   - Full name editing via `account.updateName({ name })`.
   - Optional profile fields persisted directly into Appwrite Account Preferences (`prefs`):
     - `bio`: Short biography (validated up to 200 characters with live character counter).
     - `location`: City and country text field.
     - `phone`: Contact phone number.
   - Profile picture management:
     - Drag-and-drop or file upload zone supporting JPG, PNG, WebP up to 2MB.
     - Binary stored in Appwrite Storage (primary `avatars` bucket with automated fallback to `resources` bucket).
     - Generated CDN view URL persisted to `prefs.avatarUrl`.
     - "Remove Custom Avatar" action resetting to generative Blobatar and clearing `prefs.avatarUrl`.

3. **Account Security & Session Management (`Security` Tab)**:
   - **Password Update**: Requires current password, validates new password (minimum 8 characters), and renders interactive multi-tier password strength gauge (`Weak`, `Fair`, `Good`, `Strong`).
   - **Email Update**: Updates login email with current password confirmation via `account.updateEmail({ email, password })`. Marks new address as unverified and triggers verification email workflow.
   - **Active Sessions Monitor**:
     - Lists all active login sessions using `account.listSessions()`.
     - Displays device category icon (Laptop vs Smartphone), browser name, OS version, client IP address, country, and a "This Device" badge for the current session.
     - Single session revocation action (`account.deleteSession({ sessionId })`).
     - "Revoke All Other Sessions" action clearing all remote active sessions.

4. **Preferences & Localization (`Preferences` Tab)**:
   - **Interface Theme**: Three-state visual switcher (`Light`, `Dark`, `System`) integrated with `next-themes`.
   - **Language Selection**: UI language selection (English, Spanish, French, German, Japanese, Hindi) saved to `prefs.language`.
   - **Email Notifications**: Switch component toggling announcement and article alerts saved to `prefs.emailNotifications`.

5. **Session Termination**:
   - Single-click **Log Out** button ending current session via `account.deleteSession({ sessionId: 'current' })` and redirecting user to `/sign-in`.

6. **Danger Zone & Account Deletion**:
   - Distinctive destructive-accented security section at the bottom of the Security tab.
   - Confirmation dialog warning that deletion is permanent and irreversible.
   - Double-confirmation validation: user must type either `"DELETE"` or their exact email address to enable the deletion action.
   - Executed via secure server endpoint `POST /api/user/delete`, which verifies the session, removes the user record via Appwrite Admin SDK (`users.delete`), purges active session cookies, and redirects to `/sign-in`.

#### Architectural Resolution of Profile Open Questions
- **Profile Field Persistence**: Stored directly in Appwrite Account Preferences (`account.updatePrefs()`), eliminating custom database schema migrations while keeping settings coupled to the user's auth identity.
- **Email Verification Sequence**: Standard Appwrite pattern — email updates apply immediately with password validation, setting status to Unverified and allowing the user to request a verification email token.
- **Account Deletion Protocol**: Immediate purge with double-confirmation modal, authenticated session verification, and complete server-side user deletion.

---

### 4.8 Administrative Workspace & Overview (`/dashboard`)

#### Description
Central command interface for platform operations, accessible strictly to users with `admin` or `super_user` labels.

#### Functional Specifications
1. **Executive KPI Cards**:
   - Total Site Page Views (with period-over-period trend indicator).
   - Total Unique Visitors.
   - Total Blog Articles (count of published vs active drafts).
   - Storage Volume & Resource Counts.
2. **Collapsible Admin Navigation (`AppSidebar.tsx`)**:
   - Built on shadcn/ui `Sidebar` components.
   - Sections: Overview (`/dashboard`), Blog Management (`/dashboard/blog`), Analytics (`/dashboard/analytics`), Profile (`/profile`), Settings.
3. **Breadcrumb & Header Controls**:
   - Dynamic path breadcrumbs (`BreadcrumbList`).
   - Header user badge with direct logout action and profile shortcut (`DashboardHeaderUser.tsx`).

---

## 5. Data Models & API Specifications

### 5.1 Appwrite Database Collections

#### Collection 1: `blogs`
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `$id` | String | Yes | Unique document ID (`ID.unique()`) |
| `title` | String (255) | Yes | Article title |
| `slug` | String (255) | Yes | URL-safe identifier (indexed for lookup) |
| `content` | String (Long Text) | Yes | HTML / Tiptap JSON content body |
| `thumbnail_url` | String (URL) | No | Optional featured image URL |
| `author_name` | String (128) | Yes | Author display name (defaults to "Vikas Dhavande") |
| `published_at` | Datetime (ISO 8601) | No | Null if draft; ISO timestamp if published |
| `metadata` | String (JSON) | No | Metadata, SEO description, and custom tags |
| `$createdAt` | Datetime | Auto | Creation timestamp |
| `$updatedAt` | Datetime | Auto | Last modification timestamp |

#### Collection 2: `analytics_events`
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `$id` | String | Yes | Unique event ID |
| `event_name` | String (64) | Yes | e.g. `page_view`, `resource_download` |
| `path` | String (255) | Yes | Requested route path (e.g. `/resources`) |
| `session_id` | String (128) | Yes | Client anonymous session hash |
| `user_agent` | String (512) | No | Client browser user agent |
| `referrer` | String (255) | No | HTTP Referrer header |
| `metadata` | String (JSON) | No | Contextual attributes (screen size, load time) |
| `$createdAt` | Datetime | Auto | Event timestamp (used for time-series range filtering) |

---

### 5.2 Storage Bucket Specifications

#### Bucket: `resources`
| Property | Value | Description |
| :--- | :--- | :--- |
| **Bucket ID** | `resources` | Primary asset bucket configured in environment variables |
| **Max File Size** | 50 MB | Enforced on Appwrite and route handler layers |
| **Allowed File Types** | All MIME types | Supports PDFs, code archives, documents, images, audio, video |
| **File Security** | Session Guarded | File upload/delete requires authenticated Appwrite session |
| **Read Access** | Public View / Download URLs | Direct edge CDN links with project token verification |

---

### 5.3 Core API Endpoints Contract

#### Storage Endpoints
- `GET /api/storage/files`: Lists files from Appwrite Storage. Accepts `?bucketId=` and `?search=`.
- `POST /api/storage/files`: Multipart form upload. Validates authentication session cookie; writes to bucket. Returns created file record (`201 Created`).
- `DELETE /api/storage/files?fileId=<id>`: Deletes specified file. Validates session cookie (`200 OK`).
- `POST /api/storage/presigned-url`: Generates file upload metadata destination (`uploadUrl`, `bucketId`, `fileId`).
- `GET /api/drive/files`: Legacy Google Drive compatibility route forwarding to Appwrite Storage `resources`.

#### Blog Endpoints
- `GET /api/blog`: Returns list of all published blogs (public) or all blogs including drafts (admin authenticated).
- `POST /api/blog`: Creates a new post. Validates title, slug, content, and publication status (`201 Created`).
- `GET /api/blog/:slug`: Fetches single blog document matching slug identifier.
- `PUT /api/blog/:id`: Updates existing post title, content, thumbnail, or publication timestamp.
- `DELETE /api/blog/:id`: Deletes post from collection.

#### Analytics Endpoints
- `POST /api/analytics/track`: Ingests client interaction telemetry event. Body: `{ event_name, path, session_id }`.
- `GET /api/analytics/stats?range=24h|7d|30d`: Returns aggregated `{ totalViews, uniqueVisitors, topPages, chartData }`.

#### User Account Endpoints
- `POST /api/user/delete`: Authenticated endpoint to permanently delete user account and active sessions. Body: `{ confirmation: string }`. Validates that confirmation matches `"DELETE"` or the caller's email. Requires active session cookie (`200 OK`).

---

## 6. Design System & Aesthetics Guidelines

The UI adheres strictly to the tokens documented in [DESIGN.md](file:///c:/Users/vikas/OneDrive/Desktop/Vikas/Vikas-Dhavande1/Vikas-dhavande1/DESIGN.md), derived from the Lightswind UI aesthetic:

### 6.1 Color Architecture
- **Base Surfaces**: Deep dark background `#09090B` (neutral 950) and elevated card surface `#18181B` (neutral 900 / 90% opacity).
- **Text & Foreground**: Primary high-contrast text `#F4F4F5`, secondary subtle description `#A1A1AA`, muted text `#71717A`.
- **Border System**: Translucent borders `rgba(39, 39, 42, 0.8)` (`#27272ACC`) creating clean boundary separation without harsh lines.
- **Accents**:
  - Blue (`#3B82F6`): Focus rings, cloud storage icons, active navigation indicators.
  - Rose / Crimson (`#E11D48`): Primary highlights, active badges, neon accents.
  - Emerald (`#34D399`): Positive growth trends, upload confirmations.
  - Amber (`#FBBF24`): Draft badges, system warnings.

### 6.2 Typography & Spacing
- **Font Family**: Geist Sans (`@fontsource-variable/geist`) with fallbacks to system sans-serif.
- **Scale**: Headings at 48px (700 weight, -1.2px tracking), subheadings at 14px (600 weight), body text at 18px (400 weight, 28px line-height).
- **Corner Radii**: Standard cards use `12px` / `24px` rounded corners; chips and button badges use `9999px` full pills.
- **Motion Durations**: Standard micro-interactions timed at `0.15s` to `0.3s` using cubic-bezier easing `cubic-bezier(0, 0, 0.2, 1)`.

---

## 7. Non-Functional & Operational Requirements

### 7.1 Performance Benchmarks
- **Lighthouse Performance Score**: Target >= 92 on Desktop, >= 85 on Mobile.
- **Largest Contentful Paint (LCP)**: <= 1.8 seconds on standard broadband.
- **First Input Delay (FID) / INP**: <= 100 milliseconds for all interactive elements.
- **Cumulative Layout Shift (CLS)**: <= 0.05.

### 7.2 Security & Compliance
- **Session Protection**: All sessions authenticated via Appwrite HTTP-only secure cookies preventing XSS token exfiltration.
- **Server API Key Isolation**: `APPWRITE_API_KEY` is strictly reserved for server-side route handlers (`node-appwrite`) and never exposed in client bundles.
- **Role Boundary Checks**: Route guarding occurs at the Edge (`src/middleware.ts`) before any page components or data handlers execute.
- **Input Sanitization**: Rich-text HTML output generated by Tiptap is sanitized prior to public rendering to eliminate stored XSS vectors.

### 7.3 Reliability & Error Handling
- **Graceful Fallbacks**: If Appwrite databases or storage buckets are unreachable, endpoints return standard JSON error structures (`{ error: string }`) with appropriate HTTP status codes (400, 401, 403, 503).
- **UI Error Feedback**: Client-side errors trigger non-blocking toast notifications via `sonner`.

---

## 8. Strategic Forward Roadmap

Per strategic prioritization, product evolution focuses on a **Content & Community First** trajectory, followed by expanded cloud storage capabilities and advanced telemetry.

```
+---------------------------------------------------------------------------------------+
|                                  FORWARD ROADMAP                                      |
+----------------------------+-----------------------------+----------------------------+
|  Phase 1: Content & Social |  Phase 2: Advanced Storage  |  Phase 3: Observability    |
|  - Nested Article Comments |  - Direct S3 Presigned Flow |  - Real-time Visitor Stream|
|  - Dynamic Social OG Cards |  - Nested Folder Hierarchy  |  - Automated Bounce Rates  |
|  - Newsletter Subscription |  - Expiring Share Links     |  - Geo-Location Heatmaps   |
|  - Multi-Author CMS & Tags |  - Storage Quota Governors  |  - CSV Telemetry Exports   |
+----------------------------+-----------------------------+----------------------------+
```

### 8.1 Phase 1: Content & Community First (Next Release Cycle)

#### Feature 1.1: Interactive Article Comments & Discussion System
- **Objective**: Foster technical discussion and feedback directly under published blog posts.
- **Implementation**:
  - Add Appwrite collection `blog_comments` with fields: `blog_id`, `user_id`, `author_name`, `content`, `parent_comment_id` (threaded replies).
  - Authenticated users can post comments; anonymous users can view comments.
  - Moderation queue in `/dashboard/blog/comments` allowing administrators to approve, flag, or delete comments.

#### Feature 1.2: Dynamic Social Sharing & Automated OpenGraph Card Generator
- **Objective**: Maximize organic sharing reach on Twitter/X, LinkedIn, and GitHub.
- **Implementation**:
  - Next.js dynamic OpenGraph image generation (`@vercel/og` / ImageResponse) in `app/blog/[slug]/opengraph-image.tsx`.
  - Automatically synthesizes article title, author avatar, reading time estimate, and Lightswind visual gradient into an OG image (1200x630).
  - One-click social share buttons (Copy Link, Share to X, Share to LinkedIn).

#### Feature 1.3: Reader Newsletter & Subscriber Management
- **Objective**: Build a direct audience channel for new technical articles and release updates.
- **Implementation**:
  - Add email subscription component to `/blog` and footer.
  - Store subscribers in Appwrite `subscribers` collection with opt-in status.
  - Automated webhook / notification triggering emails when new posts are published.

#### Feature 1.4: Enhanced Editorial Suite (Tags, Syntax Highlighting & Draft Previews)
- **Objective**: Upgrade the Tiptap authoring interface into a premier technical publishing tool.
- **Implementation**:
  - Code block syntax highlighting (e.g. Prism / Lowlight integration inside Tiptap).
  - Tag taxonomy allowing multiple tag badges per article with tag-filtered browse pages (`/blog/tag/[tag]`).
  - Secret shareable draft preview URL for pre-publication proofreading.

---

### 8.2 Phase 2: Cloud Storage & Asset Evolution

#### Feature 2.1: Direct-to-S3 Presigned Upload Pipeline
- **Objective**: Handle multi-gigabyte files and release bundles exceeding standard gateway limits.
- **Implementation**:
  - Activate AWS S3 SDK packages already present in `package.json` (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`).
  - Implement two-phase upload: request presigned S3 upload URL via `/api/storage/presigned-url`, upload directly from client browser to S3, record file metadata in database.

#### Feature 2.2: Folder Hierarchies & Public File Sharing Links
- **Objective**: Allow structured organization of developer assets (e.g., `/projects/firmware/v1.0`).
- **Implementation**:
  - Support virtual folder trees via `path` metadata in storage records.
  - Time-limited, expiring public download links for gated resources.

---

### 8.3 Phase 3: Telemetry & Enterprise Governance

#### Feature 3.1: Real-Time Visitor Streaming & Geolocation Heatmaps
- **Objective**: Provide instantaneous awareness of site traffic spikes during project launches.
- **Implementation**:
  - WebSocket or Server-Sent Events (SSE) telemetry feed in `/dashboard/analytics`.
  - Country-level geolocation resolution via Cloudflare/Vercel headers (`x-vercel-ip-country`) visualized on a world map.

#### Feature 3.2: Automated Data Export & Observability Alarms
- **Objective**: Export analytics to CSV/JSON and trigger Discord/Slack alerts on traffic anomalies or API 500 error spikes.

---

## 9. Technical Debt & Remediation Backlog

1. **Legacy Google Drive Cleanup**:
   - *Status*: `/api/drive/files` currently acts as an Appwrite proxy.
   - *Action*: Deprecate the legacy route in v1.1.0; migrate any external references directly to `/api/storage/files`.
2. **MongoDB Atlas Consolidation**:
   - *Status*: `MONGODB_URI` exists in `.env.example`, but current active runtime uses Appwrite Databases.
   - *Action*: Remove unused MongoDB connection stubs or formalize MongoDB as a secondary archive layer.
3. **Automated End-to-End Test Suite**:
   - *Status*: Unit tests configured with Vitest; Storybook components configured.
   - *Action*: Implement end-to-end Playwright tests covering the complete authentication, blog creation, and file upload lifecycle in CI/CD.

---

## 10. Document Sign-Off & Verification Criteria

| Verification Area | Success Standard | Verification Method |
| :--- | :--- | :--- |
| **Authentication Flow** | Email and OAuth sessions create valid cookies and correctly reflect user roles. | Manual and automated login validation. |
| **Edge Guard** | Non-authenticated requests to `/dashboard` redirect to `/sign-in`; non-admin authenticated requests redirect to `/`. | Middleware route testing with varied cookie headers. |
| **Storage Pipeline** | Files upload, list, download, and delete cleanly from Appwrite bucket `resources`. | Storage API tests across PDF, code, and image MIME types. |
| **Blog CMS** | Drafts remain hidden from `/blog`; publishing instantly updates public listing. | End-to-end editorial verification. |
| **Analytics Telemetry** | Page visits register in `analytics_events` and correctly aggregate into 24h, 7d, and 30d charts. | Trigger test events and check Recharts visualization. |
