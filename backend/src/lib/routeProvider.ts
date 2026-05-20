import type { BackendEnv } from '../config/env.js';
import { fetchJson, type Fetcher } from './http.js';
import type { RouteResult } from '../types.js';
import { getGoogleRoute } from './googleRoutesProvider.js';

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
  env: Pick<BackendEnv, 'googleMapsApiKey'>,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<RouteResult> {
  if (env.googleMapsApiKey) {
    const googleRoute = await getGoogleRoute(fromLng, fromLat, toLng, toLat, env.googleMapsApiKey, options);
    if (googleRoute) return googleRoute;
  }

  const osrm = await getOsrmRoute(fromLng, fromLat, toLng, toLat, {
    fetcher: options.fetcher,
    fallbackReason: env.googleMapsApiKey ? 'google_routes_unavailable' : 'google_maps_key_missing',
  });
  if (osrm) return osrm;

  throw new Error('osrm_unavailable');
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
