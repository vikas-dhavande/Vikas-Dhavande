# Graph Report - webx  (2026-04-26)

## Corpus Check
- 117 files · ~63,649 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 311 nodes · 270 edges · 10 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 16 edges
2. `getSupabase()` - 7 edges
3. `POST()` - 6 edges
4. `Logger` - 6 edges
5. `fetchFiles()` - 5 edges
6. `middleware()` - 5 edges
7. `useAuth()` - 5 edges
8. `createClient()` - 5 edges
9. `validateStateCookie()` - 4 edges
10. `handleEmailUpdate()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `createOAuthClient()` --calls--> `GET()`  [INFERRED]
  api\_lib\google-auth.ts → app\auth\callback\route.ts
- `validateStateCookie()` --calls--> `GET()`  [INFERRED]
  api\_lib\google-auth.ts → app\auth\callback\route.ts
- `parseStoredTokens()` --calls--> `GET()`  [INFERRED]
  api\_lib\google-auth.ts → app\auth\callback\route.ts
- `jsonResponse()` --calls--> `GET()`  [INFERRED]
  api\_lib\responses.ts → app\auth\callback\route.ts
- `GET()` --calls--> `normaliseRange()`  [INFERRED]
  app\auth\callback\route.ts → src\lib\analytics-utils.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (10): aggregateEvents(), normaliseRange(), middleware(), jsonResponse(), DELETE(), GET(), PATCH(), POST() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (9): AppSidebar(), LoginModal(), NavDocuments(), NavUser(), cn(), SidebarMenuSubButton(), useSidebar(), useAuth() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (12): createBlog(), getBlogBySlug(), getBlogs(), connectToDatabase(), fetchBlogs(), handleAvatarUpload(), handleDelete(), handleDrop() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (11): clearCookie(), parseCookies(), serializeCookie(), appendCookie(), assertGoogleCredentials(), createOAuthClient(), createStateCookie(), expireCookie() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (3): handleSignIn(), Logger, handlePlayVideo()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (5): fetchFiles(), handleBackClick(), handleDownload(), handleFolderClick(), handleProviderLogin()

### Community 12 - "Community 12"
Cohesion: 0.47
Nodes (3): canSelectAnalyticsEvents(), canWriteBlog(), isAdminRole()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): BreadcrumbLink(), cn()

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (2): ChartAreaInteractive(), useIsMobile()

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (2): Badge(), cn()

## Knowledge Gaps
- **Thin community `Community 13`** (5 nodes): `Breadcrumb()`, `BreadcrumbLink()`, `BreadcrumbPage()`, `cn()`, `breadcrumb.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (5 nodes): `ChartAreaInteractive()`, `chart-area-interactive.tsx`, `use-mobile.ts`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (5 nodes): `Badge()`, `badge.tsx`, `utils.ts`, `calculateReadingTime()`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `GET()` (e.g. with `validateStateCookie()` and `parseStoredTokens()`) actually correct?**
  _`GET()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `getSupabase()` (e.g. with `handlePasswordUpdate()` and `handleEmailUpdate()`) actually correct?**
  _`getSupabase()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `POST()` (e.g. with `createClient()` and `.error()`) actually correct?**
  _`POST()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `fetchFiles()` (e.g. with `.info()` and `.error()`) actually correct?**
  _`fetchFiles()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._