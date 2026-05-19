import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MissionBriefingPanel } from './MissionBriefingPanel';

describe('MissionBriefingPanel', () => {
  it('renders Start, Edit Scenario, and Cancel choices for the triggered briefing', () => {
    const html = renderToStaticMarkup(
      <MissionBriefingPanel
        action="ai_dispatch"
        city="karachi"
        backendStatus="fallback"
        onStart={() => undefined}
        onEditScenario={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(html).toContain('Mission briefing');
    expect(html).toContain('Karachi');
    expect(html).toContain('Start');
    expect(html).toContain('Edit Scenario');
    expect(html).toContain('Cancel');
    expect(html).toContain('offline fallback');
  });
});
