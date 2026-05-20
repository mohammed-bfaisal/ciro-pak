import { create } from 'zustand';
import type { TrafficFlow } from '../api/traffic';
import type { City, Signal } from '../types';

export type LiveDataStateKind = 'idle' | 'live' | 'fallback' | 'disabled';

export interface LiveDataStatus {
  state: LiveDataStateKind;
  provider: 'none' | 'google' | 'simulated' | 'backend' | 'mock';
  updatedAt?: string;
  fallbackReason?: string;
}

interface LiveDataState {
  weatherByCity: Partial<Record<City, Signal>>;
  trafficFlows: Record<string, TrafficFlow>;
  weatherStatus: LiveDataStatus;
  trafficStatus: LiveDataStatus;
  setWeatherSignal: (city: City, signal: Signal) => void;
  setTrafficFlow: (scopeKey: string, flow: TrafficFlow) => void;
  setWeatherDisabled: () => void;
  setTrafficDisabled: () => void;
  resetCity: (city: City) => void;
  reset: () => void;
}

const idleStatus: LiveDataStatus = {
  state: 'idle',
  provider: 'none',
};

export const useLiveDataStore = create<LiveDataState>((set) => ({
  weatherByCity: {},
  trafficFlows: {},
  weatherStatus: idleStatus,
  trafficStatus: idleStatus,

  setWeatherSignal: (city, signal) => set((state) => ({
    weatherByCity: {
      ...state.weatherByCity,
      [city]: signal,
    },
    weatherStatus: {
      state: signal.rawData.fallbackReason ? 'fallback' : 'live',
      provider: signal.rawData.fallbackReason ? 'mock' : 'backend',
      updatedAt: signal.timestamp,
      fallbackReason: typeof signal.rawData.fallbackReason === 'string'
        ? signal.rawData.fallbackReason
        : undefined,
    },
  })),

  setTrafficFlow: (scopeKey, flow) => set((state) => ({
    trafficFlows: {
      ...state.trafficFlows,
      [scopeKey]: flow,
    },
    trafficStatus: {
      state: flow.provider === 'google' ? 'live' : 'fallback',
      provider: flow.provider,
      updatedAt: flow.updatedAt,
      fallbackReason: flow.fallbackReason,
    },
  })),

  setWeatherDisabled: () => set({
    weatherStatus: {
      state: 'disabled',
      provider: 'none',
    },
  }),

  setTrafficDisabled: () => set({
    trafficStatus: {
      state: 'disabled',
      provider: 'none',
    },
  }),

  resetCity: (city) => set((state) => {
    const weatherByCity = { ...state.weatherByCity };
    delete weatherByCity[city];

    const trafficFlows = Object.fromEntries(
      Object.entries(state.trafficFlows).filter(([key]) => !key.startsWith(`${city}:`)),
    );

    return {
      weatherByCity,
      trafficFlows,
      weatherStatus: idleStatus,
      trafficStatus: Object.keys(trafficFlows).length === 0 ? idleStatus : state.trafficStatus,
    };
  }),

  reset: () => set({
    weatherByCity: {},
    trafficFlows: {},
    weatherStatus: idleStatus,
    trafficStatus: idleStatus,
  }),
}));

export function makeTrafficScopeKey(
  city: City,
  kind: 'city' | 'crisis' | 'route',
  id: string,
): string {
  return `${city}:${kind}:${id}`;
}
