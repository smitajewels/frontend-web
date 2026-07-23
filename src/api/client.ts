import type { ApiResponse } from "../types/api";

export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

let accessToken: string | null = localStorage.getItem(ACCESS_KEY);

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function saveTokens(access: string, refresh: string) {
  accessToken = access;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export async function clearTokens() {
  accessToken = null;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  const json: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> =
    await res.json();
  if (!json.success || !json.data) return false;
  await saveTokens(json.data.tokens.accessToken, json.data.tokens.refreshToken);
  return true;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: `HTTP ${res.status}`,
    data: null,
  }));

  if (res.status === 401 && retry && (await refreshAccessToken())) {
    return apiRequest<T>(path, options, false);
  }

  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }

  return json;
}
