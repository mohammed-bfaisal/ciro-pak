import { describe, expect, it } from 'vitest';
import { P04_MAP_LAYER_IDS } from '../../foundation/missionBriefing';
import { createMissionBriefingFeatureCollection } from './missionBriefingLayers';

describe('mission briefing map layers', () => {
  it('creates a city-scoped feature collection for P04 layer data', () => {
    const data = createMissionBriefingFeatureCollection('lahore');

    expect(data.features).toHaveLength(1);
    expect(data.features[0].properties).toEqual({
      id: 'p04-lahore',
      title: 'P04 mission briefing ready',
    });
  });

  it('uses the public P04 map layer identifiers', () => {
    expect(P04_MAP_LAYER_IDS.primary).toBe('ciro-triggered-mission-briefing-panel-primary');
    expect(P04_MAP_LAYER_IDS.labels).toBe('ciro-triggered-mission-briefing-panel-labels');
  });
});
