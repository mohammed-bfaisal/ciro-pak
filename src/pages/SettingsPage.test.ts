import { describe, expect, it } from 'vitest';
import type { LiveDataStatus } from '../store/liveDataStore';
import { getTrafficProxyDetail, getTrafficProxyTone, getTrafficProxyValue } from '../utils/liveDataStatusLabels';

describe('SettingsPage traffic proxy status', () => {
  it('surfaces Google road segment coverage when drawable traffic geometry exists', () => {
    const status: LiveDataStatus = {
      state: 'live',
      provider: 'google',
      trafficMode: 'google_segments',
      segmentCount: 4,
    };

    expect(getTrafficProxyValue(status, true, true)).toBe('Google road segments');
    expect(getTrafficProxyDetail(status, true)).toBe('4 live road segments');
    expect(getTrafficProxyTone(status, true, true)).toBe('good');
  });

  it('surfaces Google no-route-geometry responses distinctly from fallback', () => {
    const status: LiveDataStatus = {
      state: 'live',
      provider: 'google',
      trafficMode: 'no_route_geometry',
      segmentCount: 0,
    };

    expect(getTrafficProxyValue(status, true, true)).toBe('No route geometry');
    expect(getTrafficProxyDetail(status, true)).toBe('Google responded without drawable road segments');
    expect(getTrafficProxyTone(status, true, true)).toBe('warn');
  });

  it('surfaces fallback traffic with a reason when live segments are absent', () => {
    const status: LiveDataStatus = {
      state: 'fallback',
      provider: 'simulated',
      trafficMode: 'fallback',
      segmentCount: 0,
      fallbackReason: 'backend_unavailable',
    };

    expect(getTrafficProxyValue(status, true, true)).toBe('Fallback');
    expect(getTrafficProxyDetail(status, true)).toBe('Fallback: backend_unavailable');
    expect(getTrafficProxyTone(status, true, true)).toBe('warn');
  });
});
