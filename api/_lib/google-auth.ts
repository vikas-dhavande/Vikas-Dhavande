import crypto from 'node:crypto';
import { google } from 'googleapis';
import { clearCookie, parseCookies, serializeCookie, type CookieOptions } from './cookies';
import { serverEnv } from './env';

export const AUTH_COOKIE_NAME = 'auth_tokens';
export const OAUTH_STATE_COOKIE_NAME = 'oauth_state';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.readonly',
];

export interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}

function assertGoogleCredentials() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
}

function signValue(value: string) {
  return crypto.createHmac('sha256', serverEnv.cookieSecret).update(value).digest('hex');
}

export function createOAuthClient() {
  assertGoogleCredentials();

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${serverEnv.appOrigin}/api/auth/callback`,
  );
}

export function createStateCookie() {
  const state = crypto.randomBytes(32).toString('hex');
  const signature = signValue(state);

  return {
    cookieValue: `${state}.${signature}`,
    state,
  };
}

export function validateStateCookie(request: Request, returnedState: string) {
  const cookies = parseCookies(request.headers.get('cookie'));
  const cookieValue = cookies[OAUTH_STATE_COOKIE_NAME];

  if (!cookieValue) {
    return false;
  }

  const [storedState, signature] = cookieValue.split('.');
  if (!storedState || !signature) {
    return false;
  }

  return storedState === returnedState && signValue(storedState) === signature;
}

export function getStateCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    path: '/',
    sameSite: 'Lax',
    secure: serverEnv.isSecureCookies,
  };
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    path: '/',
    sameSite: serverEnv.isSecureCookies ? 'None' : 'Lax',
    secure: serverEnv.isSecureCookies,
  };
}

export function appendCookie(headers: Headers, name: string, value: string, options: CookieOptions) {
  headers.append('Set-Cookie', serializeCookie(name, value, options));
}

export function expireCookie(headers: Headers, name: string, options: CookieOptions) {
  headers.append('Set-Cookie', clearCookie(name, options));
}

export function parseStoredTokens(request: Request): StoredTokens | null {
  const cookies = parseCookies(request.headers.get('cookie'));
  const rawValue = cookies[AUTH_COOKIE_NAME];

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredTokens;
  } catch {
    return null;
  }
}

export function serializeStoredTokens(tokens: StoredTokens) {
  return JSON.stringify({
    access_token: tokens.access_token,
    expiry_date: tokens.expiry_date,
    refresh_token: tokens.refresh_token,
  });
}

export function getOAuthSuccessHtml() {
  return `
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '${serverEnv.appOrigin}');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <p>Authentication successful. This window should close automatically.</p>
      </body>
    </html>
  `;
}
