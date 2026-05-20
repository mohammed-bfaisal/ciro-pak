import type { BackendEnv } from '../config/env.js';
import type { CongestionLevel, TrafficFlow } from '../types.js';
import type { Fetcher } from './http.js';
import { getGoogleRoute } from './googleRoutesProvider.js';

export async function getTrafficFlow(
  lat: number,
  lng: number,
  env: Pick<BackendEnv, 'googleMapsApiKey'>,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<TrafficFlow> {
  if (!env.googleMapsApiKey) {
    return getSimulatedTraffic(lat, lng, 'google_maps_key_missing', options.now);
  }

  try {
    const probe = getProbeRoute(lat, lng);
    const route = await getGoogleRoute(
      probe.fromLng,
      probe.fromLat,
      probe.toLng,
      probe.toLat,
      env.googleMapsApiKey,
      options,
    );
    if (!route?.distanceMeters || !route.freeFlowEtaSeconds || !route.trafficSegments?.length) {
      return getSimulatedTraffic(lat, lng, 'google_routes_unavailable', options.now);
    }

    const currentSpeed = speedKmph(route.distanceMeters, route.etaSeconds);
    const freeFlowSpeed = speedKmph(route.distanceMeters, route.freeFlowEtaSeconds);

    return {
      lat,
      lng,
      congestionLevel: congestionFromSpeeds(currentSpeed, freeFlowSpeed),
      currentSpeed,
      freeFlowSpeed,
      provider: 'google',
      updatedAt: (options.now?.() ?? new Date()).toISOString(),
      trafficSegments: route.trafficSegments,
      rawData: {
        distanceMeters: route.distanceMeters,
        etaSeconds: route.etaSeconds,
        freeFlowEtaSeconds: route.freeFlowEtaSeconds,
        trafficDelaySeconds: route.trafficDelaySeconds,
      },
    };
  } catch {
    return getSimulatedTraffic(lat, lng, 'google_routes_unavailable', options.now);
  }
}

export function getSimulatedTraffic(
  lat: number,
  lng: number,
  fallbackReason: 'google_maps_key_missing' | 'google_routes_unavailable',
  now?: () => Date,
): TrafficFlow {
  const seed = Math.abs(Math.sin((lat * 17.91) + (lng * 11.37)));
  const freeFlowSpeed = 46;
  const currentSpeed = Math.max(4, Math.round(freeFlowSpeed * (0.25 + seed * 0.7)));

  return {
    lat,
    lng,
    congestionLevel: congestionFromSpeeds(currentSpeed, freeFlowSpeed),
    currentSpeed,
    freeFlowSpeed,
    provider: 'simulated',
    updatedAt: (now?.() ?? new Date()).toISOString(),
    fallbackReason,
    rawData: {
      deterministicSeed: Number(seed.toFixed(4)),
    },
  };
}

function getProbeRoute(lat: number, lng: number) {
  const latOffset = 0.0045;
  const lngOffset = 0.012 / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
  return {
    fromLat: lat - latOffset,
    fromLng: lng - lngOffset,
    toLat: lat + latOffset,
    toLng: lng + lngOffset,
  };
}

function speedKmph(distanceMeters: number, seconds: number): number {
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.max(1, Math.round((distanceMeters / seconds) * 3.6));
}

export function congestionFromSpeeds(
  currentSpeed: number,
  freeFlowSpeed: number,
  roadClosure = false,
): CongestionLevel {
  if (roadClosure || currentSpeed <= 5) return 'standstill';
  const ratio = currentSpeed / Math.max(1, freeFlowSpeed);
  if (ratio >= 0.75) return 'free';
  if (ratio >= 0.45) return 'moderate';
  return 'heavy';
}
