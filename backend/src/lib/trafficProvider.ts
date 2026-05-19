import type { BackendEnv } from '../config/env.js';
import { fetchJson, type Fetcher } from './http.js';
import type { CongestionLevel, TrafficFlow } from '../types.js';

interface TomTomTrafficResponse {
  flowSegmentData?: {
    currentSpeed?: number;
    freeFlowSpeed?: number;
    currentTravelTime?: number;
    freeFlowTravelTime?: number;
    confidence?: number;
    roadClosure?: boolean;
  };
}

export async function getTrafficFlow(
  lat: number,
  lng: number,
  env: Pick<BackendEnv, 'tomtomApiKey'>,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<TrafficFlow> {
  if (!env.tomtomApiKey) {
    return getSimulatedTraffic(lat, lng, 'tomtom_key_missing', options.now);
  }

  const params = new URLSearchParams({
    point: `${lat},${lng}`,
    unit: 'KMPH',
    key: env.tomtomApiKey,
  });

  try {
    const data = await fetchJson<TomTomTrafficResponse>(
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?${params.toString()}`,
      {},
      { fetcher: options.fetcher, timeoutMs: 5000 },
    );
    const segment = data.flowSegmentData;
    if (!segment?.currentSpeed || !segment.freeFlowSpeed) {
      return getSimulatedTraffic(lat, lng, 'tomtom_unavailable', options.now);
    }

    return {
      lat,
      lng,
      congestionLevel: congestionFromSpeeds(segment.currentSpeed, segment.freeFlowSpeed, segment.roadClosure),
      currentSpeed: segment.currentSpeed,
      freeFlowSpeed: segment.freeFlowSpeed,
      provider: 'tomtom',
      updatedAt: (options.now?.() ?? new Date()).toISOString(),
      rawData: {
        currentTravelTime: segment.currentTravelTime,
        freeFlowTravelTime: segment.freeFlowTravelTime,
        confidence: segment.confidence,
        roadClosure: segment.roadClosure,
      },
    };
  } catch {
    return getSimulatedTraffic(lat, lng, 'tomtom_unavailable', options.now);
  }
}

export function getSimulatedTraffic(
  lat: number,
  lng: number,
  fallbackReason: 'tomtom_key_missing' | 'tomtom_unavailable',
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
