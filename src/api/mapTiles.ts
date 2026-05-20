import { apiFetch, apiUrl, type ApiClientOptions } from './client';

export type MapTileMode = 'dark' | 'light' | 'satellite';

export interface MapTileSessionDescriptor {
  provider: 'google' | 'fallback';
  mode: MapTileMode;
  tileUrl: string | null;
  attribution: string;
  tileSize: number;
  expiresAt?: string;
  fallbackReason?: 'google_maps_key_missing' | 'google_map_tiles_unavailable';
}

export async function fetchMapTileSession(
  mode: MapTileMode,
  options: ApiClientOptions = {},
): Promise<MapTileSessionDescriptor> {
  return await apiFetch<MapTileSessionDescriptor>(
    `/api/map-tiles/session?mode=${encodeURIComponent(mode)}`,
    {},
    options,
  );
}

export function toAbsoluteTileUrl(tileUrl: string, baseUrl?: string | null): string {
  const cleanedBaseUrl = baseUrl?.replace(/\/+$/, '') ?? baseUrl;
  return apiUrl(tileUrl, cleanedBaseUrl).replace(/%7B/g, '{').replace(/%7D/g, '}');
}
