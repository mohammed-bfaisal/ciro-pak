const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const TOMTOM_BASE = 'https://api.tomtom.com/routing/1/calculateRoute';

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

interface RoutingOptions {
  fetcher?: typeof fetch;
  tomtomApiKey?: string;
  now?: () => Date;
}

interface TomTomResponse {
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

export async function fetchRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  options: RoutingOptions = {},
): Promise<RouteResult | null> {
  const fetcher = options.fetcher ?? fetch;
  const tomtomApiKey = options.tomtomApiKey ?? import.meta.env.VITE_TOMTOM_API_KEY;

  if (tomtomApiKey) {
    const tomtomRoute = await fetchTomTomRoute(fromLng, fromLat, toLng, toLat, {
      fetcher,
      tomtomApiKey,
      now: options.now ?? (() => new Date()),
    });
    if (tomtomRoute) return tomtomRoute;
  }

  return fetchOsrmRoute(fromLng, fromLat, toLng, toLat, {
    fetcher,
    fallbackReason: tomtomApiKey ? 'tomtom_unavailable' : 'tomtom_key_missing',
  });
}

async function fetchTomTomRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  options: Required<Pick<RoutingOptions, 'fetcher' | 'tomtomApiKey' | 'now'>>,
): Promise<RouteResult | null> {
  try {
    const params = new URLSearchParams({
      key: options.tomtomApiKey,
      traffic: 'true',
      routeType: 'fastest',
      travelMode: 'car',
      computeTravelTimeFor: 'all',
      routeRepresentation: 'polyline',
    });
    const url = `${TOMTOM_BASE}/${fromLat},${fromLng}:${toLat},${toLng}/json?${params.toString()}`;
    const res = await options.fetcher(url);
    if (!res.ok) return null;
    const data = await res.json() as TomTomResponse;
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
      trafficUpdatedAt: options.now().toISOString(),
    };
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
