import { create } from 'zustand';
import type { Resource, GeoPoint } from '../types';
import { tickMovement } from '../simulation/movementEngine';

type DispatchMode = 'off' | 'manual' | 'ai';

interface ResourceState {
  resources: Resource[];
  simulationRunning: boolean;
  simulationSpeed: 1 | 2 | 4;
  isPaused: boolean;
  dispatchMode: DispatchMode;
  selectedUnitId: string | null;

  setResources: (resources: Resource[]) => void;
  assignResource: (resourceId: string, crisisId: string) => void;
  updateStatus: (resourceId: string, status: Resource['status'], etaMinutes?: number) => void;
  dispatchUnit: (unitId: string, crisisId: string, target: GeoPoint, etaMinutes: number, routeCoordinates?: [number, number][]) => void;
  tick: (deltaMinutes?: number) => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: 1 | 2 | 4) => void;
  togglePause: () => void;
  setDispatchMode: (mode: DispatchMode) => void;
  selectUnit: (id: string | null) => void;
  reset: () => void;
}

export const useResourceStore = create<ResourceState>((set, get) => ({
  resources: [],
  simulationRunning: false,
  simulationSpeed: 1,
  isPaused: false,
  dispatchMode: 'off',
  selectedUnitId: null,

  setResources: (resources) => set({
    resources: resources.map((r) => ({
      ...r,
      currentPosition: r.currentPosition ?? r.location,
      movementProgress: r.movementProgress ?? 0,
    })),
  }),

  assignResource: (resourceId, crisisId) => set((state) => ({
    resources: state.resources.map((r) =>
      r.id === resourceId
        ? { ...r, assignedCrisisId: crisisId, status: 'dispatched' as const }
        : r
    ),
  })),

  updateStatus: (resourceId, status, etaMinutes) => set((state) => ({
    resources: state.resources.map((r) =>
      r.id === resourceId ? { ...r, status, ...(etaMinutes !== undefined && { etaMinutes }) } : r
    ),
  })),

  dispatchUnit: (unitId, crisisId, target, etaMinutes, routeCoordinates) => set((state) => ({
    resources: state.resources.map((r) => {
      if (r.id !== unitId) return r;

      const start = r.currentPosition ?? r.location;
      const route = routeCoordinates && routeCoordinates.length > 1
        ? routeCoordinates
        : [
            [start.lng, start.lat],
            [target.lng, target.lat],
          ] satisfies [number, number][];

      return {
        ...r,
        assignedCrisisId: crisisId,
        status: 'en_route' as const,
        targetPosition: target,
        movementProgress: 0,
        etaMinutes,
        lastEtaMinutes: etaMinutes,
        routeCoordinates: route,
        returnRouteCoordinates: [...route].reverse(),
        assignmentHistory: [
          ...(r.assignmentHistory ?? []),
          { crisisId, assignedAt: new Date().toISOString() },
        ],
      };
    }),
    selectedUnitId: null,
    simulationRunning: true,
    isPaused: false,
  })),

  tick: (deltaMinutes) => {
    const { resources, simulationSpeed } = get();
    set({ resources: tickMovement(resources, deltaMinutes ?? simulationSpeed) });
  },

  toggleSimulation: () => set((state) => ({ simulationRunning: !state.simulationRunning })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setDispatchMode: (mode) => set({ dispatchMode: mode, selectedUnitId: null }),
  selectUnit: (id) => set({ selectedUnitId: id }),

  reset: () => set({
    resources: [],
    simulationRunning: false,
    isPaused: false,
    dispatchMode: 'off',
    selectedUnitId: null,
  }),
}));
