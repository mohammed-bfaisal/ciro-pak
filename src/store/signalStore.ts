import { create } from 'zustand';
import type { Signal } from '../types';

interface SignalState {
  rawSignals: Signal[];
  fusedSignals: Signal[];
  signals: Signal[];
  setRaw: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  setFused: (signals: Signal[]) => void;
  reset: () => void;
}

export const useSignalStore = create<SignalState>((set) => ({
  rawSignals: [],
  fusedSignals: [],
  signals: [],
  setRaw: (signals) => set({ rawSignals: signals }),
  addSignal: (signal) => set((state) => ({
    signals: [...state.signals, signal],
  })),
  setFused: (signals) => set({ fusedSignals: signals, signals }),
  reset: () => set({ rawSignals: [], fusedSignals: [], signals: [] }),
}));
