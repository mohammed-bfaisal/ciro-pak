export class BackendNotConfiguredError extends Error {
  constructor() {
    super('VITE_API_BASE_URL is not configured');
    this.name = 'BackendNotConfiguredError';
  }
}

export interface ApiClientOptions {
  baseUrl?: string | null;
  fetcher?: typeof fetch;
}

export function getConfiguredApiBaseUrl(raw = import.meta.env.VITE_API_BASE_URL as string | undefined): string | null {
  const cleaned = raw?.trim();
  if (!cleaned) return null;
  return cleaned.replace(/\/+$/, '');
}

export function apiUrl(path: string, baseUrl = getConfiguredApiBaseUrl()): string {
  if (!baseUrl) throw new BackendNotConfiguredError();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {},
): Promise<T> {
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const baseUrl = Object.prototype.hasOwnProperty.call(options, 'baseUrl')
    ? options.baseUrl
    : getConfiguredApiBaseUrl();
  const url = apiUrl(path, baseUrl);
  const response = await fetcher(url, init);
  if (!response.ok) {
    throw new Error(`Backend API ${response.status}`);
  }
  return await response.json() as T;
}

export function isBackendConfigured(baseUrl = getConfiguredApiBaseUrl()): boolean {
  return Boolean(baseUrl);
}
