/**
 * Token storage utilities.
 *
 * Stores the DRF auth token (key) in:
 *   1. localStorage  — for client-side reads (fetcher, isAuthenticated)
 *   2. A browser cookie — so Next.js middleware can check auth on the Edge
 *
 * The token is a simple opaque string — no JWT decode needed.
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

export function getAccessToken(): string | null {
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

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
