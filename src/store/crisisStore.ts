import { create } from 'zustand';
import type { Crisis } from '../types';

interface CrisisState {
  crises: Crisis[];
  selectedCrisisId: string | null;
  addCrisis: (crisis: Crisis) => void;
  updateCrisis: (id: string, updates: Partial<Crisis>) => void;
  retractCrisis: (id: string) => void;
  selectCrisis: (id: string | null) => void;
  reset: () => void;
}

export const useCrisisStore = create<CrisisState>((set) => ({
  crises: [],
  selectedCrisisId: null,
  addCrisis: (crisis) => set((state) => ({
    crises: [...state.crises, crisis],
  })),
  updateCrisis: (id, updates) => set((state) => ({
    crises: state.crises.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),
  retractCrisis: (id) => set((state) => ({
    crises: state.crises.map((c) =>
      c.id === id ? { ...c, status: 'false_alarm' as const, verificationStatus: 'retracted' as const } : c
    ),
  })),
  selectCrisis: (id) => set({ selectedCrisisId: id }),
  reset: () => set({ crises: [], selectedCrisisId: null }),
}));
