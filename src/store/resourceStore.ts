import { create } from 'zustand';
import type { Resource } from '../types';

interface ResourceState {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  assignResource: (resourceId: string, crisisId: string) => void;
  updateStatus: (resourceId: string, status: Resource['status'], etaMinutes?: number) => void;
  reset: () => void;
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: [],
  setResources: (resources) => set({ resources }),
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
  reset: () => set({ resources: [] }),
}));
