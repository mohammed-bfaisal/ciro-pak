import { fetchJson, type Fetcher } from './http.js';

const GOOGLE_CREATE_SESSION_URL = 'https://tile.googleapis.com/v1/createSession';
const GOOGLE_TILE_BASE_URL = 'https://tile.googleapis.com/v1/2dtiles';

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

interface GoogleMapTileSessionResponse {
  session?: string;
  expiry?: string;
  tileWidth?: number;
  tileHeight?: number;
  imageFormat?: string;
}

interface CachedSession {
  session: string;
  expiresAtMs: number;
  tileSize: number;
}

const sessionCache = new Map<MapTileMode, CachedSession>();

export function normalizeMapTileMode(value: string | undefined): MapTileMode {
  if (value === 'light' || value === 'satellite') return value;
  return 'dark';
}

export async function createMapTileSessionDescriptor(
  rawMode: MapTileMode,
  googleMapsApiKey: string | undefined,
  options: { fetcher?: Fetcher; basePath?: string; now?: () => Date } = {},
): Promise<MapTileSessionDescriptor> {
  const mode = normalizeMapTileMode(rawMode);
  if (!googleMapsApiKey) {
    return buildFallbackDescriptor(mode, 'google_maps_key_missing');
  }

  const session = await getGoogleMapTileSession(mode, googleMapsApiKey, options);
  if (!session) {
    return buildFallbackDescriptor(mode, 'google_map_tiles_unavailable');
  }

  const basePath = options.basePath ?? '/api/map-tiles';
  return {
    provider: 'google',
    mode,
    tileUrl: `${basePath}/tiles/${mode}/{z}/{x}/{y}`,
    attribution: 'Map data (c) Google',
    tileSize: session.tileSize,
    expiresAt: new Date(session.expiresAtMs).toISOString(),
  };
}

export async function fetchGoogleMapTile(
  rawMode: string,
  z: number,
  x: number,
  y: number,
  googleMapsApiKey: string,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<{ bytes: Buffer; contentType: string } | null> {
  const mode = normalizeMapTileMode(rawMode);
  const session = await getGoogleMapTileSession(mode, googleMapsApiKey, options);
  if (!session) return null;

  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const url = new URL(`${GOOGLE_TILE_BASE_URL}/${z}/${x}/${y}`);
  url.searchParams.set('session', session.session);
  url.searchParams.set('key', googleMapsApiKey);

  const response = await fetcher(url);
  if (!response.ok) return null;
  const arrayBuffer = await response.arrayBuffer();
  return {
    bytes: Buffer.from(arrayBuffer),
    contentType: response.headers.get('content-type') ?? 'image/png',
  };
}

export function buildGoogleMapTileSessionRequest(mode: MapTileMode) {
  if (mode === 'satellite') {
    return {
      mapType: 'satellite',
      language: 'en-US',
      region: 'PK',
      layerTypes: ['layerRoadmap'],
      overlay: false,
      scale: 'scaleFactor1x',
      highDpi: false,
    };
  }

  return {
    mapType: 'roadmap',
    language: 'en-US',
    region: 'PK',
    layerTypes: ['layerRoadmap'],
    overlay: false,
    scale: 'scaleFactor1x',
    highDpi: false,
    styles: mode === 'dark' ? darkRoadmapStyles : lightRoadmapStyles,
  };
}

async function getGoogleMapTileSession(
  mode: MapTileMode,
  googleMapsApiKey: string,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<CachedSession | null> {
  const nowMs = (options.now?.() ?? new Date()).getTime();
  const cached = sessionCache.get(mode);
  if (cached && cached.expiresAtMs - nowMs > 60_000) {
    return cached;
  }

  try {
    const url = new URL(GOOGLE_CREATE_SESSION_URL);
    url.searchParams.set('key', googleMapsApiKey);
    const response = await fetchJson<GoogleMapTileSessionResponse>(
      url.toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildGoogleMapTileSessionRequest(mode)),
      },
      { fetcher: options.fetcher, timeoutMs: 8000 },
    );

    if (!response.session) return null;
    const expiresAtMs = parseExpiryMs(response.expiry, nowMs);
    const tileSize = Number.isFinite(response.tileWidth) ? Number(response.tileWidth) : 256;
    const session: CachedSession = {
      session: response.session,
      expiresAtMs,
      tileSize,
    };
    sessionCache.set(mode, session);
    return session;
  } catch {
    return null;
  }
}

function buildFallbackDescriptor(
  mode: MapTileMode,
  fallbackReason: NonNullable<MapTileSessionDescriptor['fallbackReason']>,
): MapTileSessionDescriptor {
  return {
    provider: 'fallback',
    mode,
    tileUrl: null,
    attribution: 'Fallback map style',
    tileSize: 256,
    fallbackReason,
  };
}

function parseExpiryMs(expiry: string | undefined, fallbackNowMs: number): number {
  const unixSeconds = Number.parseInt(expiry ?? '', 10);
  if (Number.isFinite(unixSeconds) && unixSeconds > 0) return unixSeconds * 1000;
  return fallbackNowMs + 30 * 60_000;
}

const darkRoadmapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#151922' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#d7dee8' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }, { weight: 2 }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#283142' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#344057' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4b5563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f2237' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const lightRoadmapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f3f4f6' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#1f2937' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2 }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#d1d5db' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfdbfe' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
