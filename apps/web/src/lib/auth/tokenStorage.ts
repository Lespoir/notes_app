/**
 * Token storage utilities.
 *
 * Stores the DRF auth token in localStorage and syncs to a browser cookie
 * so Next.js middleware can check authentication on the Edge runtime.
 */

const TOKEN_KEY = 'auth_token';
/** Cookie max-age: 30 days in seconds */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function setCookie(value: string): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function deleteCookie(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  setCookie(token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  deleteCookie();
}
