# WebX

A Vite React SPA with Vercel-hosted API routes for Google OAuth and Google Drive access.

## Project Structure

```text
api/
  _lib/       # shared Vercel function helpers
  auth/       # OAuth endpoints
  drive/      # Google Drive endpoints
src/
  components/ # UI and layout components
  hooks/      # client auth and shared hooks
  lib/        # shared client utilities, including the current Supabase helper
  pages/      # route-level React pages
```

## Run Locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Fill in your Google OAuth credentials.
4. Run `npm run dev` for the frontend only.
5. Run `npm run dev:vercel` when you want the Vercel API routes locally as well.

## Deploy on Vercel

- Build command: `npm run build`
- Output directory: `dist`
- OAuth callback URL: `https://<your-domain>/api/auth/callback`

React Router deep links are handled through `vercel.json`, and `/api/*` is reserved for Vercel Functions.
