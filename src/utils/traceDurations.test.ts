import { describe, expect, it } from 'vitest';
import { getPhaseDurationData } from './traceDurations';
import type { Workplan } from '../types';

describe('getPhaseDurationData', () => {
  it('returns completed phase durations and omits missing duration values', () => {
    const workplan: Workplan = {
      sessionId: 'ciro-karachi-1',
      city: 'karachi',
      startedAt: '2026-05-20T12:00:00.000Z',
      phases: [
        { name: 'Signal Fusion', tasks: [], status: 'complete', durationMs: 1200, logs: [] },
        { name: 'Action Execution', tasks: [], status: 'running', logs: [] },
        { name: 'False Alarm Correction', tasks: [], status: 'complete', durationMs: 400, logs: [] },
      ],
      summary: {
        crisisesDetected: 2,
        actionsExecuted: 7,
        actionsRecovered: 1,
        falseAlarms: 1,
        totalCostPKR: 600,
        totalLatencyMs: 2380,
      },
    };

    expect(getPhaseDurationData(workplan)).toEqual([
      { name: 'Signal Fusion', durationMs: 1200 },
      { name: 'False Alarm Correction', durationMs: 400 },
    ]);
  });
});
