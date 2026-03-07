import { clearToken, getToken } from '@/lib/auth/tokenStorage';

const AUTH_ENDPOINTS = ['/api/auth/login/', '/api/auth/register/'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly body: any,
  ) {
    super(`HTTP ${status}`);
    this.name = 'ApiError';
  }
}

export async function customFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Token ${token}` }
    : {};

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = null; }

    if (response.status === 401 && !AUTH_ENDPOINTS.some(ep => url.includes(ep))) {
      clearToken();
      window.location.href = '/auth/login';
      return new Promise(() => {}); // prevent further execution
    }

    throw new ApiError(response.status, body);
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) {
    return { data: undefined, status: 204, headers: response.headers } as unknown as T;
  }

  const data = await response.json();
  return { data, status: response.status, headers: response.headers } as T;
}
