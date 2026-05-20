import { beforeEach, describe, expect, it } from 'vitest';
import type { TrafficFlow } from '../api/traffic';
import type { Signal } from '../types';
import { deriveTrafficStatus, makeTrafficScopeKey, useLiveDataStore } from './liveDataStore';

const weatherSignal: Signal = {
  id: 'weather-karachi-live',
  source: 'weather',
  content: 'Live rain alert',
  location: { lat: 24.86, lng: 67.01, label: 'Karachi' },
  timestamp: '2026-05-19T09:00:00.000Z',
  credibilityScore: 0.9,
  urgencyScore: 0.8,
  isFlagged: false,
  rawData: { source: 'OpenWeatherMap' },
};

const trafficFlow: TrafficFlow = {
  lat: 24.86,
  lng: 67.01,
  congestionLevel: 'heavy',
  currentSpeed: 12,
  freeFlowSpeed: 45,
  provider: 'google',
  updatedAt: '2026-05-19T09:00:00.000Z',
};

describe('live data store', () => {
  beforeEach(() => {
    useLiveDataStore.getState().reset();
  });

  it('tracks weather provider state per city', () => {
    useLiveDataStore.getState().setWeatherSignal('karachi', weatherSignal);

    expect(useLiveDataStore.getState().weatherByCity.karachi).toBe(weatherSignal);
    expect(useLiveDataStore.getState().weatherStatus).toEqual({
      state: 'live',
      provider: 'backend',
      updatedAt: '2026-05-19T09:00:00.000Z',
      fallbackReason: undefined,
    });
  });

  it('tracks traffic flow state per scoped map target', () => {
    const scopeKey = makeTrafficScopeKey('karachi', 'crisis', 'khi-c1');
    useLiveDataStore.getState().setTrafficFlow(scopeKey, trafficFlow);

    expect(useLiveDataStore.getState().trafficFlows[scopeKey]).toBe(trafficFlow);
    expect(useLiveDataStore.getState().trafficStatus.state).toBe('live');
    expect(useLiveDataStore.getState().trafficStatus.provider).toBe('google');
  });

  it('derives Google road segment status when live traffic includes drawable geometry', () => {
    const status = deriveTrafficStatus({
      ...trafficFlow,
      trafficSegments: [
        { coords: [[67.0, 24.86], [67.02, 24.87]], congestionLevel: 'heavy' },
        { coords: [[67.02, 24.87]], congestionLevel: 'moderate' },
      ],
    });

    expect(status).toMatchObject({
      state: 'live',
      provider: 'google',
      trafficMode: 'google_segments',
      segmentCount: 1,
    });
  });

  it('derives no-route-geometry status when Google traffic is live but not drawable', () => {
    const status = deriveTrafficStatus({
      ...trafficFlow,
      trafficSegments: [],
    });

    expect(status).toMatchObject({
      state: 'live',
      provider: 'google',
      trafficMode: 'no_route_geometry',
      segmentCount: 0,
    });
  });

  it('derives fallback status when traffic is simulated', () => {
    const status = deriveTrafficStatus({
      ...trafficFlow,
      provider: 'simulated',
      fallbackReason: 'backend_unavailable',
    });

    expect(status).toMatchObject({
      state: 'fallback',
      provider: 'simulated',
      fallbackReason: 'backend_unavailable',
      trafficMode: 'fallback',
      segmentCount: 0,
    });
  });

  it('removes city-scoped live data without touching other cities', () => {
    useLiveDataStore.getState().setWeatherSignal('karachi', weatherSignal);
    useLiveDataStore.getState().setTrafficFlow(
      makeTrafficScopeKey('karachi', 'crisis', 'khi-c1'),
      trafficFlow,
    );
    useLiveDataStore.getState().setTrafficFlow(
      makeTrafficScopeKey('lahore', 'crisis', 'lhr-c1'),
      { ...trafficFlow, lat: 31.52, lng: 74.35 },
    );

    useLiveDataStore.getState().resetCity('karachi');

    expect(useLiveDataStore.getState().weatherByCity.karachi).toBeUndefined();
    expect(useLiveDataStore.getState().trafficFlows).toEqual({
      'lahore:crisis:lhr-c1': { ...trafficFlow, lat: 31.52, lng: 74.35 },
    });
  });
});
