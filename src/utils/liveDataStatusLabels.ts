import type { LiveDataStatus } from '../store/liveDataStore';

export type StatusTone = 'good' | 'warn' | 'muted';

export function getTrafficProxyValue(
  status: LiveDataStatus,
  updatesEnabled: boolean,
  healthReady: boolean,
): string {
  if (!updatesEnabled || status.state === 'disabled') return 'Disabled';
  if (status.trafficMode) return formatTrafficMode(status.trafficMode);
  return healthReady ? 'Ready' : 'Fallback';
}

export function getTrafficProxyDetail(status: LiveDataStatus, updatesEnabled: boolean): string {
  if (!updatesEnabled || status.state === 'disabled') return 'Updates disabled';
  if (status.trafficMode === 'google_segments') {
    const count = status.segmentCount ?? 0;
    return `${count} live road segment${count === 1 ? '' : 's'}`;
  }
  if (status.trafficMode === 'no_route_geometry') {
    return 'Google responded without drawable road segments';
  }
  if (status.trafficMode === 'fallback') {
    return status.fallbackReason ? `Fallback: ${status.fallbackReason}` : 'Fallback traffic probe';
  }
  return 'Updates enabled';
}

export function getTrafficProxyTone(
  status: LiveDataStatus,
  updatesEnabled: boolean,
  healthReady: boolean,
): StatusTone {
  if (!updatesEnabled || status.state === 'disabled') return 'muted';
  if (status.trafficMode === 'google_segments') return 'good';
  if (status.trafficMode === 'no_route_geometry' || status.trafficMode === 'fallback') return 'warn';
  return healthReady ? 'good' : 'warn';
}

export function formatTrafficMode(mode: NonNullable<LiveDataStatus['trafficMode']>): string {
  switch (mode) {
    case 'google_segments':
      return 'Google road segments';
    case 'fallback':
      return 'Fallback';
    case 'no_route_geometry':
      return 'No route geometry';
  }
}
