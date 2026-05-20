import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TraceSummaryFooter } from './TracePage';
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
});
