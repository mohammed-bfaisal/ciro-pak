import { create } from 'zustand';
import type { AgentTraceEvent, City, ImpactSnapshot } from '../types';
import { getCityData } from '../data/cityData';
import type { P00Status } from '../foundation/contracts';
import type { P01Status } from '../foundation/urduRtlLanguage';
import type { P04Status } from '../foundation/triggeredMissionBriefing';
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
  p00Status: P00Status;
  p00LastUpdatedAt: string | null;
  p00ErrorState: string | null;
  p01Status: P01Status;
  p01LastUpdatedAt: string | null;
  p01ErrorState: string | null;
  p04Status: P04Status;
  p04LastUpdatedAt: string | null;
  p04ErrorState: string | null;
  start: (city: City) => void;
  tick: (deltaMinutes: number) => void;
  resolve: (crisisId: string, responseMinutes: number) => void;
  addTraceEvents: (events: AgentTraceEvent[]) => void;
  addImpactSnapshots: (snapshots: ImpactSnapshot[]) => void;
  setP00Status: (status: P00Status, updatedAt: string) => void;
  setP00ErrorState: (message: string | null) => void;
  setP01Status: (status: P01Status, updatedAt: string) => void;
  setP01ErrorState: (message: string | null) => void;
  setP04Status: (status: P04Status, updatedAt: string) => void;
  setP04ErrorState: (message: string | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  live: null,
  traceEvents: [],
  impactSnapshots: [],
  p00Status: 'idle',
  p00LastUpdatedAt: null,
  p00ErrorState: null,
  p01Status: 'idle',
  p01LastUpdatedAt: null,
  p01ErrorState: null,
  p04Status: 'idle',
  p04LastUpdatedAt: null,
  p04ErrorState: null,

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

  setP00Status: (p00Status, p00LastUpdatedAt) => set({
    p00Status,
    p00LastUpdatedAt,
    p00ErrorState: p00Status === 'error' ? get().p00ErrorState : null,
  }),

  setP00ErrorState: (message) => set({
    p00Status: message ? 'error' : 'idle',
    p00ErrorState: message,
    p00LastUpdatedAt: new Date().toISOString(),
  }),

  setP01Status: (p01Status, p01LastUpdatedAt) => set({
    p01Status,
    p01LastUpdatedAt,
    p01ErrorState: p01Status === 'error' ? get().p01ErrorState : null,
  }),

  setP01ErrorState: (message) => set({
    p01Status: message ? 'error' : 'idle',
    p01ErrorState: message,
    p01LastUpdatedAt: new Date().toISOString(),
  }),

  setP04Status: (p04Status, p04LastUpdatedAt) => set({
    p04Status,
    p04LastUpdatedAt,
    p04ErrorState: p04Status === 'error' ? get().p04ErrorState : null,
  }),

  setP04ErrorState: (message) => set({
    p04Status: message ? 'error' : 'idle',
    p04ErrorState: message,
    p04LastUpdatedAt: new Date().toISOString(),
  }),

  reset: () => set({
    live: null,
    traceEvents: [],
    impactSnapshots: [],
    p00Status: 'idle',
    p00LastUpdatedAt: null,
    p00ErrorState: null,
    p01Status: 'idle',
    p01LastUpdatedAt: null,
    p01ErrorState: null,
    p04Status: 'idle',
    p04LastUpdatedAt: null,
    p04ErrorState: null,
  }),
}));
