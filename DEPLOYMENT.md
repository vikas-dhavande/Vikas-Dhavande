# Production Deployment Guide

This project is optimized for production-ready hosting on **Vercel**, which provides the best experience for Next.js applications, including server-side rendering, API routes, and global CDN distribution.

## 🚀 Recommended Platform: Vercel

Vercel is the primary hosting platform for this project due to its native support for Next.js features like Route Handlers (API) and automatic image optimization.

### **1. Preparation**
Ensure all environment variables from `identity-platform/.env.example` are ready.

### **2. Deploy to Vercel**
1.  **Connect GitHub**: Go to [vercel.com](https://vercel.com) and import your repository.
2.  **Configuration**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `identity-platform`
    *   **Build Command**: `next build` (Vercel will detect this automatically)
3.  **Environment Variables**: Add the following keys in the Vercel Dashboard:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `GOOGLE_API_KEY`
    *   `GOOGLE_DRIVE_FOLDER_ID`
    *   `GOOGLE_CLIENT_ID`
    *   `GOOGLE_CLIENT_SECRET`
    *   `SUPABASE_S3_ACCESS_KEY_ID`
    *   `SUPABASE_S3_SECRET_ACCESS_KEY`
    *   `SUPABASE_S3_REGION`
    *   `SUPABASE_S3_ENDPOINT`

### **3. SSL & Domains**
*   Vercel automatically provisions and renews SSL certificates via Let's Encrypt.
*   You can add a custom domain under **Settings > Domains**.

---

## 🛠️ Build & CI/CD Pipeline

The project uses a hybrid CI/CD strategy:

1.  **Vercel (Production)**: Triggered automatically on every push to `main`. Provides preview deployments for every Pull Request.
2.  **GitHub Pages (Static Backup)**: A workflow is configured in `.github/workflows/pages.yml` to generate a static export of the site.
    *   *Note: Static exports on GitHub Pages do not support dynamic API routes or server-side logic.*

---

## 🔒 Security & Performance

*   **Security Headers**: Configured in `vercel.json` to prevent XSS, clickjacking, and MIME-type sniffing.
*   **Standalone Output**: Optimized for minimal deployment size.
*   **Edge Functions**: API routes are designed to run on Vercel's Edge network for low-latency responses.

---

## 📈 Monitoring & Rollbacks

*   **Monitoring**: Use the **Vercel Analytics** tab to track Web Vitals and performance.
*   **Logging**: Runtime logs are available in the Vercel dashboard under **Logs**.
*   **Rollbacks**: Every deployment is immutable. If a production issue occurs, you can revert to a previous deployment with one click in the Vercel Dashboard.

---

## 🔄 Maintenance

To update dependencies and keep the platform secure:
```bash
# Run security audit
npm audit

# Update dependencies
npm update
```
