import type { RouteResult, TrafficSegment, CongestionLevel } from '../types.js';
import { fetchJson, type Fetcher } from './http.js';

const GOOGLE_ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const GOOGLE_ROUTE_FIELD_MASK = [
  'routes.distanceMeters',
  'routes.duration',
  'routes.staticDuration',
  'routes.polyline.geoJsonLinestring',
  'routes.travelAdvisory.speedReadingIntervals',
].join(',');

interface GoogleRoutesResponse {
  routes?: GoogleRoute[];
}

interface GoogleRoute {
  distanceMeters?: number;
  duration?: string;
  staticDuration?: string;
  polyline?: {
    geoJsonLinestring?: {
      coordinates?: [number, number][];
    };
  };
  travelAdvisory?: {
    speedReadingIntervals?: GoogleSpeedReadingInterval[];
  };
}

interface GoogleSpeedReadingInterval {
  startPolylinePointIndex?: number;
  endPolylinePointIndex?: number;
  speed?: 'NORMAL' | 'SLOW' | 'TRAFFIC_JAM';
}

export async function getGoogleRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  googleMapsApiKey: string,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<RouteResult | null> {
  try {
    const data = await fetchJson<GoogleRoutesResponse>(
      GOOGLE_ROUTES_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleMapsApiKey,
          'X-Goog-FieldMask': GOOGLE_ROUTE_FIELD_MASK,
        },
        body: JSON.stringify(buildGoogleRouteRequest(fromLng, fromLat, toLng, toLat)),
      },
      { fetcher: options.fetcher, timeoutMs: 8000 },
    );
    return mapGoogleRoute(data.routes?.[0], options.now);
  } catch {
    return null;
  }
}

export function mapGoogleSpeedToCongestion(speed: GoogleSpeedReadingInterval['speed']): CongestionLevel {
  switch (speed) {
    case 'NORMAL':
      return 'free';
    case 'SLOW':
      return 'heavy';
    case 'TRAFFIC_JAM':
      return 'standstill';
    default:
      return 'moderate';
  }
}

export function buildTrafficSegments(
  coords: [number, number][],
  intervals: GoogleSpeedReadingInterval[] | undefined,
): TrafficSegment[] {
  if (coords.length < 2 || !intervals?.length) return [];

  return intervals.flatMap((interval) => {
    const start = clampIndex(interval.startPolylinePointIndex ?? 0, coords.length - 1);
    const end = clampIndex(interval.endPolylinePointIndex ?? coords.length - 1, coords.length - 1);
    if (end <= start) return [];
    const segmentCoords = coords.slice(start, end + 1);
    if (segmentCoords.length < 2) return [];
    return [{
      coords: segmentCoords,
      congestionLevel: mapGoogleSpeedToCongestion(interval.speed),
    }];
  });
}

function mapGoogleRoute(route: GoogleRoute | undefined, now?: () => Date): RouteResult | null {
  const coords = route?.polyline?.geoJsonLinestring?.coordinates?.filter(isCoordinate) ?? [];
  const etaSeconds = parseDurationSeconds(route?.duration);
  if (!route || coords.length < 2 || !etaSeconds) return null;

  const freeFlowEtaSeconds = parseDurationSeconds(route.staticDuration);
  const trafficDelaySeconds = freeFlowEtaSeconds === undefined
    ? undefined
    : Math.max(0, etaSeconds - freeFlowEtaSeconds);

  return {
    coords,
    etaSeconds,
    etaMinutes: Math.max(1, Math.ceil(etaSeconds / 60)),
    distanceMeters: route.distanceMeters,
    provider: 'google',
    trafficDelaySeconds,
    freeFlowEtaSeconds,
    trafficUpdatedAt: (now?.() ?? new Date()).toISOString(),
    trafficSegments: buildTrafficSegments(coords, route.travelAdvisory?.speedReadingIntervals),
  };
}

function buildGoogleRouteRequest(fromLng: number, fromLat: number, toLng: number, toLat: number) {
  return {
    origin: {
      location: {
        latLng: {
          latitude: fromLat,
          longitude: fromLng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: toLat,
          longitude: toLng,
        },
      },
    },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    polylineQuality: 'HIGH_QUALITY',
    polylineEncoding: 'GEO_JSON_LINESTRING',
    computeAlternativeRoutes: false,
    extraComputations: ['TRAFFIC_ON_POLYLINE'],
  };
}

function parseDurationSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = /^(\d+(?:\.\d+)?)s$/.exec(value);
  if (!match) return undefined;
  const seconds = Math.ceil(Number(match[1]));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function isCoordinate(value: unknown): value is [number, number] {
  return Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1]);
}

function clampIndex(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.floor(value)));
}
