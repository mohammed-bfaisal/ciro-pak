import { create } from 'zustand';

export interface RadioLine {
  id: string;
  text: string;
  eventType: string;
  timestamp: string;
}

interface RadioState {
  lines: RadioLine[];
  enabled: boolean;
  addLine: (line: Omit<RadioLine, 'id'>) => void;
  toggleEnabled: () => void;
  reset: () => void;
}

export const useRadioStore = create<RadioState>((set) => ({
  lines: [],
  enabled: true,

  addLine: (line) => set((state) => ({
    lines: [...state.lines.slice(-19), { ...line, id: `radio-${Date.now()}-${Math.random()}` }],
  })),

  toggleEnabled: () => set((state) => ({ enabled: !state.enabled })),

  reset: () => set({ lines: [] }),
}));
