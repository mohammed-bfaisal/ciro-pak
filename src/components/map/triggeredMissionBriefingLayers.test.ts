import { describe, expect, it } from 'vitest';
import { P04_MAP_LAYER_IDS } from '../../foundation/triggeredMissionBriefing';
import { createTriggeredMissionBriefingFeatureCollection } from './triggeredMissionBriefingLayers';

describe('triggered mission briefing map layers', () => {
  it('creates a city-scoped briefing anchor for P04 map layers', () => {
    const data = createTriggeredMissionBriefingFeatureCollection('karachi');

    expect(data.features).toHaveLength(1);
    expect(data.features[0].properties).toEqual({
      id: 'p04-karachi',
      title: 'Mission briefing',
      scenarioTitle: 'Flood breach and heat emergency',
      cityLabel: 'Karachi',
    });
  });

  it('uses the public P04 map layer identifiers', () => {
    expect(P04_MAP_LAYER_IDS.primary).toBe('ciro-triggered-mission-briefing-panel-primary');
    expect(P04_MAP_LAYER_IDS.labels).toBe('ciro-triggered-mission-briefing-panel-labels');
  });
});
