import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TraceReasoningFields } from './AgentTracePanel';
import { useSessionStore } from '../../store/sessionStore';
import type { AgentTraceEvent } from '../../types';

describe('AgentTracePanel', () => {
  afterEach(() => {
    useSessionStore.getState().reset();
  });

  it('renders deterministic score and AI reasoning for allocation trace events', () => {
    const event: AgentTraceEvent = {
      id: 'alloc-khi-rescue-1-khi-c1',
      phase: 'Resource Allocation',
      observation: 'Rescue 1 is available for flood response.',
      inference: 'Score 87 from deterministic allocation factors.',
      decision: 'Dispatch Rescue 1.',
      execution: 'Queued route lookup.',
      timestamp: new Date('2026-05-20T12:00:00.000Z').toISOString(),
      deterministicScore: 87,
      aiReasoning: 'AI reasoning fallback: closest rescue team with flood specialization.',
    };

    const html = renderToStaticMarkup(<TraceReasoningFields event={event} />);

    expect(html).toContain('Deterministic Score');
    expect(html).toContain('87.00');
    expect(html).toContain('AI Reasoning');
    expect(html).toContain('closest rescue team');
  });
});
