import { create } from 'zustand';
import type { AgentTraceEvent, City, ImpactSnapshot } from '../types';
import { getCityData } from '../data/cityData';
import {
  advanceLiveSimulation,
  createLiveSimulation,
  resolveIncident,
  type LiveSimulationState,
} from '../simulation/sessionEngine';
import { useCrisisStore } from './crisisStore';
import { useResourceStore } from './resourceStore';
import { useSignalStore } from './signalStore';
import { useTraceStore } from './traceStore';

interface SessionState {
  live: LiveSimulationState | null;
  traceEvents: AgentTraceEvent[];
  impactSnapshots: ImpactSnapshot[];
  start: (city: City) => void;
  tick: (deltaMinutes: number) => void;
  resolve: (crisisId: string, responseMinutes: number) => void;
  addTraceEvents: (events: AgentTraceEvent[]) => void;
  addImpactSnapshots: (snapshots: ImpactSnapshot[]) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  live: null,
  traceEvents: [],
  impactSnapshots: [],

  start: (city) => {
    const cityData = getCityData(city);

    useSignalStore.getState().reset();
    useCrisisStore.getState().reset();
    useResourceStore.getState().reset();
    useTraceStore.getState().reset();

    useSignalStore.getState().setRaw(cityData.signals);
    useResourceStore.getState().setResources(cityData.resources);
    useTraceStore.getState().startSession(city);
    useTraceStore.getState().startPhase('Live Operations', [
      'Stream city signals into the command board',
      'Promote clusters into incidents when confidence crosses threshold',
      'Track dispatch outcomes, trust, and response efficiency',
    ]);
    useTraceStore.getState().log(`Session started for ${city} with ${cityData.resources.length} deployable resources.`);

    set({
      live: createLiveSimulation(city, cityData),
      traceEvents: [],
      impactSnapshots: [],
    });
  },

  tick: (deltaMinutes) => {
    const live = get().live;
    if (!live || live.session.status !== 'running') return;

    const cityData = getCityData(live.session.city);
    const result = advanceLiveSimulation(live, cityData, deltaMinutes);
    const trace = useTraceStore.getState();

    result.newSignals.forEach((signal) => {
      useSignalStore.getState().addSignal(signal);
      trace.log(`Signal ${signal.id} (${signal.source}) observed at ${signal.location.label}.`);
    });

    result.newCrises.forEach((crisis) => {
      useCrisisStore.getState().addCrisis(crisis);
      trace.log(`Incident activated: ${crisis.title} at ${crisis.location.label}.`);
    });

    result.traceEvents.forEach((event) => {
      trace.log(`${event.phase}: ${event.decision}`);
    });

    set((state) => ({
      live: result.state,
      traceEvents: [...state.traceEvents, ...result.traceEvents],
    }));
  },

  resolve: (crisisId, responseMinutes) => {
    const live = get().live;
    if (!live) return;

    const nextLive = resolveIncident(live, crisisId, responseMinutes);
    useCrisisStore.getState().updateCrisis(crisisId, { status: 'resolved' });
    useTraceStore.getState().log(`Incident resolved: ${crisisId} in ${responseMinutes} simulated minutes.`);
    set({ live: nextLive });
  },

  addTraceEvents: (events) => set((state) => ({
    traceEvents: [...state.traceEvents, ...events],
  })),

  addImpactSnapshots: (snapshots) => set((state) => ({
    impactSnapshots: [...snapshots, ...state.impactSnapshots].slice(0, 12),
  })),

  reset: () => set({ live: null, traceEvents: [], impactSnapshots: [] }),
}));
