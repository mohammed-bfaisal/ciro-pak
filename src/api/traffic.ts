import { apiFetch, type ApiClientOptions } from './client';

export type CongestionLevel = 'free' | 'moderate' | 'heavy' | 'standstill';

export interface TrafficFlow {
  lat: number;
  lng: number;
  congestionLevel: CongestionLevel;
  currentSpeed: number;
  freeFlowSpeed: number;
  provider: 'tomtom' | 'simulated';
  updatedAt: string;
  fallbackReason?: 'tomtom_key_missing' | 'tomtom_unavailable' | 'backend_not_configured' | 'backend_unavailable';
  rawData?: Record<string, unknown>;
}

export async function fetchTrafficFlow(
  lat: number,
  lng: number,
  options: ApiClientOptions & { now?: () => Date } = {},
): Promise<TrafficFlow> {
  try {
    return await apiFetch<TrafficFlow>(
      `/api/traffic/flow?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      {},
      options,
    );
  } catch (error) {
    const fallbackReason = error instanceof Error && error.name === 'BackendNotConfiguredError'
      ? 'backend_not_configured'
      : 'backend_unavailable';
    return getSimulatedTrafficFlow(lat, lng, fallbackReason, options.now);
  }
}

export function getSimulatedTrafficFlow(
  lat: number,
  lng: number,
  fallbackReason: TrafficFlow['fallbackReason'] = 'backend_not_configured',
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
