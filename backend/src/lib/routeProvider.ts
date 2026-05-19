import type { BackendEnv } from '../config/env.js';
import { fetchJson, type Fetcher } from './http.js';
import type { RouteResult } from '../types.js';

interface TomTomRouteResponse {
  routes?: {
    summary?: {
      lengthInMeters?: number;
      travelTimeInSeconds?: number;
      noTrafficTravelTimeInSeconds?: number;
      trafficDelayInSeconds?: number;
    };
    legs?: {
      points?: { latitude: number; longitude: number }[];
    }[];
  }[];
}

interface OsrmResponse {
  code: string;
  routes: {
    duration: number;
    distance?: number;
    geometry: { coordinates: [number, number][] };
  }[];
}

export async function getRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  env: Pick<BackendEnv, 'tomtomApiKey'>,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<RouteResult> {
  if (env.tomtomApiKey) {
    const tomtom = await getTomTomRoute(fromLng, fromLat, toLng, toLat, env.tomtomApiKey, options);
    if (tomtom) return tomtom;
  }

  const osrm = await getOsrmRoute(fromLng, fromLat, toLng, toLat, {
    fetcher: options.fetcher,
    fallbackReason: env.tomtomApiKey ? 'tomtom_unavailable' : 'tomtom_key_missing',
  });
  if (osrm) return osrm;

  throw new Error('osrm_unavailable');
}

async function getTomTomRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  tomtomApiKey: string,
  options: { fetcher?: Fetcher; now?: () => Date },
): Promise<RouteResult | null> {
  const params = new URLSearchParams({
    key: tomtomApiKey,
    traffic: 'true',
    routeType: 'fastest',
    travelMode: 'car',
    computeTravelTimeFor: 'all',
    routeRepresentation: 'polyline',
  });
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${fromLat},${fromLng}:${toLat},${toLng}/json?${params.toString()}`;

  try {
    const data = await fetchJson<TomTomRouteResponse>(url, {}, { fetcher: options.fetcher, timeoutMs: 5000 });
    const route = data.routes?.[0];
    const summary = route?.summary;
    const points = route?.legs?.flatMap((leg) => leg.points ?? []) ?? [];
    if (!summary?.travelTimeInSeconds || points.length < 2) return null;

    return {
      coords: points.map((point) => [point.longitude, point.latitude]),
      etaSeconds: Math.max(1, Math.ceil(summary.travelTimeInSeconds)),
      etaMinutes: Math.max(1, Math.ceil(summary.travelTimeInSeconds / 60)),
      distanceMeters: summary.lengthInMeters,
      provider: 'tomtom',
      trafficDelaySeconds: summary.trafficDelayInSeconds,
      freeFlowEtaSeconds: summary.noTrafficTravelTimeInSeconds,
      trafficUpdatedAt: (options.now?.() ?? new Date()).toISOString(),
    };
  } catch {
    return null;
  }
}

async function getOsrmRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  options: { fetcher?: Fetcher; fallbackReason: RouteResult['fallbackReason'] },
): Promise<RouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  try {
    const data = await fetchJson<OsrmResponse>(url, {}, { fetcher: options.fetcher, timeoutMs: 5000 });
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
