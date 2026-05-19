import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createMissionBriefing } from '../../foundation/triggeredMissionBriefing';
import { MissionBriefingPanel } from './MissionBriefingPanel';

describe('MissionBriefingPanel', () => {
  it('renders the required Start, Edit Scenario, and Cancel choices for simulation', () => {
    const html = renderToStaticMarkup(
      <MissionBriefingPanel
        briefing={createMissionBriefing('karachi', 'simulation', '2026-05-19T08:00:00.000Z')}
        onStart={() => undefined}
        onEditScenario={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(html).toContain('Mission Briefing');
    expect(html).toContain('Karachi');
    expect(html).toContain('Flood breach and heat emergency');
    expect(html).toContain('Start');
    expect(html).toContain('Edit Scenario');
    expect(html).toContain('Cancel');
    expect(html).not.toMatch(/api key|secret|token/i);
  });

  it('labels AI dispatch briefings before the AI action starts', () => {
    const html = renderToStaticMarkup(
      <MissionBriefingPanel
        briefing={createMissionBriefing('lahore', 'ai_dispatch', '2026-05-19T08:00:00.000Z')}
        onStart={() => undefined}
        onEditScenario={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(html).toContain('AI Dispatch');
    expect(html).toContain('Smog emergency and protest escalation');
  });
});
