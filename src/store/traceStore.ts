import { create } from 'zustand';
import type { City, Workplan, WorkplanPhase } from '../types';

export type PipelineMode = 'idle' | 'briefing' | 'running' | 'paused' | 'complete';

// Module-level resolver — avoids storing non-serializable functions in Zustand state
let _gateResolve: (() => void) | null = null;

interface TraceState {
  workplan: Workplan | null;
  isRunning: boolean;
  currentPhase: string | null;
  logs: string[];
  // Pipeline state machine
  pipelineMode: PipelineMode;
  currentPhaseIndex: number;
  pendingCity: City | null;

  startSession: (city: City) => void;
  startPhase: (name: string, tasks: string[]) => void;
  log: (message: string) => void;
  completePhase: (name: string, durationMs: number) => void;
  failPhase: (name: string) => void;
  finalise: () => void;
  reset: () => void;
  // Gate actions
  openBriefing: (city: City) => void;
  dismissBriefing: () => void;
  pauseAtGate: (phaseIndex: number) => void;
  resumeFromGate: () => void;
}

export const useTraceStore = create<TraceState>((set) => ({
  workplan: null,
  isRunning: false,
  currentPhase: null,
  logs: [],
  pipelineMode: 'idle',
  currentPhaseIndex: 0,
  pendingCity: null,

  openBriefing: (city) => set({ pipelineMode: 'briefing', pendingCity: city }),

  dismissBriefing: () => set({ pipelineMode: 'idle', pendingCity: null }),

  pauseAtGate: (phaseIndex) => set({ pipelineMode: 'paused', currentPhaseIndex: phaseIndex }),

  resumeFromGate: () => {
    set({ pipelineMode: 'running' });
    if (_gateResolve) {
      const resolve = _gateResolve;
      _gateResolve = null;
      resolve();
    }
  },

  startSession: (city) => {
    const sessionId = `ciro-${city}-${Date.now()}`;
    set({
      workplan: {
        sessionId,
        city,
        startedAt: new Date().toISOString(),
        phases: [],
        summary: {
          crisisesDetected: 0,
          actionsExecuted: 0,
          actionsRecovered: 0,
          falseAlarms: 0,
          totalCostPKR: 0,
          totalLatencyMs: 0,
        },
      },
      isRunning: true,
      pipelineMode: 'running',
      currentPhaseIndex: 0,
      logs: [],
      currentPhase: null,
    });
  },

  startPhase: (name, tasks) => {
    const ts = new Date().toISOString().slice(11, 19);
    const phase: WorkplanPhase = {
      name,
      tasks,
      status: 'running',
      logs: [],
    };
    set((state) => ({
      workplan: state.workplan
        ? { ...state.workplan, phases: [...state.workplan.phases, phase] }
        : state.workplan,
      currentPhase: name,
      logs: [...state.logs, `[${ts}] ▶ ${name}`],
    }));
  },

  log: (message) => {
    const ts = new Date().toISOString().slice(11, 19);
    set((state) => {
      const phases = state.workplan?.phases ? [...state.workplan.phases] : [];
      const lastPhase = phases[phases.length - 1];
      if (lastPhase) {
        phases[phases.length - 1] = {
          ...lastPhase,
          logs: [...lastPhase.logs, message],
        };
      }
      return {
        logs: [...state.logs, `[${ts}]   ${message}`],
        workplan: state.workplan ? { ...state.workplan, phases } : state.workplan,
      };
    });
  },

  completePhase: (name, durationMs) => {
    const ts = new Date().toISOString().slice(11, 19);
    set((state) => {
      const phases = state.workplan?.phases.map((p) =>
        p.name === name ? { ...p, status: 'complete' as const, durationMs } : p
      ) ?? [];
      return {
        workplan: state.workplan ? { ...state.workplan, phases } : state.workplan,
        currentPhase: null,
        logs: [...state.logs, `[${ts}] ✓ ${name} (${durationMs}ms)`],
      };
    });
  },

  failPhase: (name) => {
    const ts = new Date().toISOString().slice(11, 19);
    set((state) => {
      const phases = state.workplan?.phases.map((p) =>
        p.name === name ? { ...p, status: 'failed' as const } : p
      ) ?? [];
      return {
        workplan: state.workplan ? { ...state.workplan, phases } : state.workplan,
        currentPhase: null,
        logs: [...state.logs, `[${ts}] ✗ ${name} FAILED`],
      };
    });
  },

  finalise: () => {
    const ts = new Date().toISOString().slice(11, 19);
    set((state) => ({
      workplan: state.workplan
        ? { ...state.workplan, completedAt: new Date().toISOString() }
        : state.workplan,
      isRunning: false,
      pipelineMode: 'complete',
      logs: [...state.logs, `[${ts}] ═══ Pipeline Complete ═══`],
    }));
  },

  reset: () => set({
    workplan: null,
    isRunning: false,
    currentPhase: null,
    logs: [],
    pipelineMode: 'idle',
    currentPhaseIndex: 0,
    pendingCity: null,
  }),
}));

// Suspends the pipeline coroutine until resumeFromGate() is called or auto-advance fires
export function waitForGate(phaseIndex: number): Promise<void> {
  return new Promise<void>((resolve) => {
    _gateResolve = resolve;
    useTraceStore.getState().pauseAtGate(phaseIndex);
  });
}
