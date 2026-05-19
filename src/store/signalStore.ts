import { create } from 'zustand';
import type { Signal } from '../types';

interface SignalState {
  rawSignals: Signal[];
  fusedSignals: Signal[];
  signals: Signal[];
  setRaw: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  upsertSignal: (signal: Signal) => void;
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
  upsertSignal: (signal) => set((state) => {
    const existingIndex = state.signals.findIndex((item) => item.id === signal.id);
    if (existingIndex === -1) {
      return { signals: [...state.signals, signal] };
    }
    const signals = [...state.signals];
    signals[existingIndex] = signal;
    return { signals };
  }),
  setFused: (signals) => set({ fusedSignals: signals, signals }),
  reset: () => set({ rawSignals: [], fusedSignals: [], signals: [] }),
}));
