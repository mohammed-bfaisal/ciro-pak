import { beforeEach, describe, expect, it } from 'vitest';
import type { TrafficFlow } from '../api/traffic';
import type { Signal } from '../types';
import { makeTrafficScopeKey, useLiveDataStore } from './liveDataStore';

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
  provider: 'tomtom',
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
    expect(useLiveDataStore.getState().trafficStatus.provider).toBe('tomtom');
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
