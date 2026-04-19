import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

const DEFAULT_PORT = 3000;
const ENV_FILES = ['.env', '.env.local'];

let loaded = false;

function loadLocalEnv(mode = process.env.NODE_ENV ?? 'development') {
  if (loaded) {
    return;
  }

  const originalKeys = new Set(Object.keys(process.env));
  const envFiles = [...ENV_FILES, `.env.${mode}`, `.env.${mode}.local`];

  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const parsed = dotenv.parse(fs.readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
      if (originalKeys.has(key)) {
        continue;
      }

      process.env[key] = value;
    }
  }

  loaded = true;
}

loadLocalEnv();

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const appUrl =
  process.env.APP_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);

export const serverEnv = {
  appOrigin: new URL(appUrl).origin,
  appUrl,
  cookieSecret:
    process.env.COOKIE_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    'local-cookie-secret',
  isSecureCookies: appUrl.startsWith('https://'),
  port,
};
