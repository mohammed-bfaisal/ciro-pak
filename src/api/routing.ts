import { apiFetch, getConfiguredApiBaseUrl, type ApiClientOptions } from './client';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export type RoutingProvider = 'tomtom' | 'osrm';

export interface RouteResult {
  coords: [number, number][]; // [lng, lat] pairs
  etaSeconds: number;
  etaMinutes: number;
  distanceMeters?: number;
  provider: RoutingProvider;
  trafficDelaySeconds?: number;
  freeFlowEtaSeconds?: number;
  trafficUpdatedAt?: string;
  fallbackReason?: 'tomtom_key_missing' | 'tomtom_unavailable' | 'osrm_unavailable';
}

interface RoutingOptions extends ApiClientOptions {
  apiBaseUrl?: string | null;
}

interface OsrmResponse {
  code: string;
  routes: {
    duration: number;
    distance?: number;
    geometry: { coordinates: [number, number][] };
  }[];
}

export async function fetchRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  options: RoutingOptions = {},
): Promise<RouteResult | null> {
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const apiBaseUrl = Object.prototype.hasOwnProperty.call(options, 'apiBaseUrl')
    ? options.apiBaseUrl
    : getConfiguredApiBaseUrl();
  const backendRoute = await fetchBackendRoute(fromLng, fromLat, toLng, toLat, {
    fetcher,
    baseUrl: apiBaseUrl,
  });
  if (backendRoute) return backendRoute;

  return fetchOsrmRoute(fromLng, fromLat, toLng, toLat, {
    fetcher,
    fallbackReason: apiBaseUrl ? 'tomtom_unavailable' : 'tomtom_key_missing',
  });
}

async function fetchBackendRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  options: ApiClientOptions,
): Promise<RouteResult | null> {
  try {
    const params = new URLSearchParams({
      fromLng: String(fromLng),
      fromLat: String(fromLat),
      toLng: String(toLng),
      toLat: String(toLat),
    });
    const route = await apiFetch<RouteResult>(`/api/route?${params.toString()}`, {}, options);
    return isRouteResult(route) ? route : null;
  } catch {
    return null;
  }
}

async function fetchOsrmRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  options: { fetcher: typeof fetch; fallbackReason: RouteResult['fallbackReason'] },
): Promise<RouteResult | null> {
  try {
    const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await options.fetcher(url);
    if (!res.ok) return null;
    const data = await res.json() as OsrmResponse;
    if (data.code !== 'Ok' || !data.routes.length) return null;
    const route = data.routes[0];
    return {
      coords: route.geometry.coordinates,
      etaSeconds: Math.max(1, Math.ceil(route.duration)),
      etaMinutes: Math.max(1, Math.ceil(route.duration / 60)),
      distanceMeters: route.distance,
      provider: 'osrm',
      fallbackReason: options.fallbackReason,
    };
  } catch {
    return null;
  }
}

function isRouteResult(value: unknown): value is RouteResult {
  const route = value as Partial<RouteResult>;
  return Array.isArray(route.coords) &&
    typeof route.etaSeconds === 'number' &&
    typeof route.etaMinutes === 'number' &&
    (route.provider === 'tomtom' || route.provider === 'osrm');
}
