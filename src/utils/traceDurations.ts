import type { Workplan } from '../types';

export interface PhaseDurationDatum {
  name: string;
  durationMs: number;
}

export function getPhaseDurationData(workplan: Workplan): PhaseDurationDatum[] {
  return workplan.phases
    .filter((phase) => typeof phase.durationMs === 'number')
    .map((phase) => ({
      name: phase.name,
      durationMs: phase.durationMs ?? 0,
    }));
}
