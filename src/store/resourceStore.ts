import { create } from 'zustand';
import type { Resource, GeoPoint, SimulationSpeed } from '../types';
import { tickMovement } from '../simulation/movementEngine';
import type { RouteResult } from '../api/routing';

type DispatchMode = 'off' | 'manual' | 'ai';

interface ResourceState {
  resources: Resource[];
  simulationRunning: boolean;
  simulationSpeed: SimulationSpeed;
  isPaused: boolean;
  dispatchMode: DispatchMode;
  selectedUnitId: string | null;

  setResources: (resources: Resource[]) => void;
  assignResource: (resourceId: string, crisisId: string) => void;
  updateStatus: (resourceId: string, status: Resource['status'], etaMinutes?: number) => void;
  dispatchUnit: (
    unitId: string,
    crisisId: string,
    target: GeoPoint,
    etaSeconds: number,
    routeCoordinates?: [number, number][],
    routeMetadata?: Partial<RouteResult>,
  ) => void;
  updateRoute: (unitId: string, route: RouteResult, refreshedAt: string) => void;
  tick: (deltaSeconds?: number) => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
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

  dispatchUnit: (unitId, crisisId, target, etaSeconds, routeCoordinates, routeMetadata) => set((state) => ({
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
        etaSeconds,
        etaMinutes: Math.max(1, Math.ceil(etaSeconds / 60)),
        lastEtaSeconds: etaSeconds,
        lastEtaMinutes: Math.max(1, Math.ceil(etaSeconds / 60)),
        routeCoordinates: route,
        returnRouteCoordinates: [...route].reverse(),
        routeProvider: routeMetadata?.provider,
        routeFallbackReason: routeMetadata?.fallbackReason,
        routeRefreshedAt: routeMetadata?.trafficUpdatedAt,
        routeTrafficSegments: routeMetadata?.trafficSegments,
        trafficDelaySeconds: routeMetadata?.trafficDelaySeconds,
        freeFlowEtaSeconds: routeMetadata?.freeFlowEtaSeconds,
        trafficUpdatedAt: routeMetadata?.trafficUpdatedAt,
        distanceMeters: routeMetadata?.distanceMeters,
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

  updateRoute: (unitId, route, refreshedAt) => set((state) => ({
    resources: state.resources.map((resource) => {
      if (resource.id !== unitId || !resource.targetPosition) return resource;
      const start = resource.currentPosition ?? resource.location;
      const routeCoordinates = route.coords.length > 1
        ? [
            [start.lng, start.lat],
            ...route.coords.slice(1),
          ] satisfies [number, number][]
        : [
            [start.lng, start.lat],
            [resource.targetPosition.lng, resource.targetPosition.lat],
          ] satisfies [number, number][];

      return {
        ...resource,
        routeCoordinates,
        returnRouteCoordinates: [...routeCoordinates].reverse(),
        movementProgress: 0,
        etaSeconds: route.etaSeconds,
        etaMinutes: route.etaMinutes,
        lastEtaSeconds: route.etaSeconds,
        lastEtaMinutes: route.etaMinutes,
        routeProvider: route.provider,
        routeFallbackReason: route.fallbackReason,
        routeRefreshedAt: refreshedAt,
        routeTrafficSegments: route.trafficSegments,
        trafficDelaySeconds: route.trafficDelaySeconds,
        freeFlowEtaSeconds: route.freeFlowEtaSeconds,
        trafficUpdatedAt: route.trafficUpdatedAt,
        distanceMeters: route.distanceMeters,
      };
    }),
  })),

  tick: (deltaSeconds) => {
    const { resources, simulationSpeed } = get();
    set({ resources: tickMovement(resources, deltaSeconds ?? simulationSpeed) });
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
