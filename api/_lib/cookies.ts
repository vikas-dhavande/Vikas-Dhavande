export interface CookieOptions {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'Lax' | 'None' | 'Strict';
  secure?: boolean;
}

export function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  const segments = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`, `Path=${options.path ?? '/'}`];

  if (typeof options.maxAge === 'number') {
    segments.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }

  if (options.httpOnly) {
    segments.push('HttpOnly');
  }

  if (options.secure) {
    segments.push('Secure');
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }

  return segments.join('; ');
}

export function clearCookie(name: string, options: CookieOptions = {}) {
  return [
    `${encodeURIComponent(name)}=`,
    `Path=${options.path ?? '/'}`,
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    options.httpOnly ? 'HttpOnly' : '',
    options.secure ? 'Secure' : '',
    options.sameSite ? `SameSite=${options.sameSite}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}
