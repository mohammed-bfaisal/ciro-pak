import { describe, expect, it } from 'vitest';
import { DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS } from '../../displayAccessibility/contracts';
import { createDisplayAccessibilityFeatureCollection } from './displayAccessibilityLayers';

describe('display accessibility map layers', () => {
  it('creates a city-scoped feature collection for P02 layer data', () => {
    const data = createDisplayAccessibilityFeatureCollection('karachi');

    expect(data.features).toHaveLength(1);
    expect(data.features[0].properties).toEqual({
      id: 'p02-karachi',
      title: 'P02 accessible display anchor',
    });
  });

  it('uses the public P02 map layer identifiers', () => {
    expect(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.primary).toBe('ciro-display-accessibility-settings-primary');
    expect(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.labels).toBe('ciro-display-accessibility-settings-labels');
  });
});
