import { describe, expect, it } from 'vitest';
import { FOUNDATION_MAP_LAYER_IDS } from '../../foundation/contracts';
import { createFoundationFeatureCollection } from './foundationLayers';

describe('foundation map layers', () => {
  it('creates a city-scoped feature collection for P00 layer data', () => {
    const data = createFoundationFeatureCollection('karachi');

    expect(data.features).toHaveLength(1);
    expect(data.features[0].properties).toEqual({
      id: 'p00-karachi',
      title: 'P00 backend contract anchor',
    });
  });

  it('uses the public P00 map layer identifiers', () => {
    expect(FOUNDATION_MAP_LAYER_IDS.primary).toBe('ciro-foundation-settings-backend-contracts-primary');
    expect(FOUNDATION_MAP_LAYER_IDS.labels).toBe('ciro-foundation-settings-backend-contracts-labels');
  });
});
