import { getToken } from '@/lib/auth/tokenStorage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // 204 No Content — nothing to parse
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
