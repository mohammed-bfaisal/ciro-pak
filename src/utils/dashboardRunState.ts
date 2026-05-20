import type { City } from '../types';
import { getResources } from '../data/cityData';
import { useCrisisStore } from '../store/crisisStore';
import { useLiveDataStore } from '../store/liveDataStore';
import { useResourceStore } from '../store/resourceStore';
import { useSessionStore } from '../store/sessionStore';
import { useSignalStore } from '../store/signalStore';
import { useTraceStore } from '../store/traceStore';

export function ensureDashboardCityState(city: City, previousCity: City | null) {
  if (previousCity !== null && previousCity !== city) {
    resetDashboardRun(city);
    return;
  }

  const resourceStore = useResourceStore.getState();
  if (resourceStore.resources.length === 0) {
    resourceStore.setResources(getResources(city));
  }
}

export function resetDashboardRun(city: City) {
  useSessionStore.getState().reset();
  useSignalStore.getState().reset();
  useCrisisStore.getState().reset();
  useLiveDataStore.getState().reset();
  useTraceStore.getState().reset();
  useResourceStore.getState().reset();
  useResourceStore.getState().setResources(getResources(city));
}
