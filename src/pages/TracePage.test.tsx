import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TraceSummaryFooter } from './TracePage';
import { buildTraceExportFilename, serializeTraceExport } from '../utils/traceExport';
import type { Workplan } from '../types';

describe('TraceSummaryFooter', () => {
  it('renders session cost and latency evidence from the workplan summary', () => {
    const workplan: Workplan = {
      sessionId: 'ciro-karachi-1',
      city: 'karachi',
      startedAt: '2026-05-20T12:00:00.000Z',
      phases: [],
      summary: {
        crisisesDetected: 2,
        actionsExecuted: 7,
        actionsRecovered: 1,
        falseAlarms: 1,
        totalCostPKR: 600,
        totalLatencyMs: 2380,
      },
    };

    const html = renderToStaticMarkup(<TraceSummaryFooter workplan={workplan} />);

    expect(html).toContain('Session total: 2.4s');
    expect(html).toContain('7 actions');
    expect(html).toContain('1 recovered');
    expect(html).toContain('Est. cost: PKR ~600');
    expect(html).toContain('Avg latency: 340ms/action');
  });

  it('serializes the full workplan with a safe json filename', () => {
    const workplan: Workplan = {
      sessionId: 'ciro-karachi/live run',
      city: 'karachi',
      startedAt: '2026-05-20T12:00:00.000Z',
      completedAt: '2026-05-20T12:00:06.400Z',
      phases: [
        {
          name: 'Resource Allocation',
          tasks: ['score units'],
          status: 'complete',
          durationMs: 600,
          logs: ['Allocated rescue unit'],
        },
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

    expect(buildTraceExportFilename(workplan)).toBe('ciro-karachi-live-run.json');
    expect(serializeTraceExport(workplan)).toContain('"sessionId": "ciro-karachi/live run"');
    expect(serializeTraceExport(workplan)).toContain('"Resource Allocation"');
  });
});
