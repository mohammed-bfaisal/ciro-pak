import { describe, expect, it } from 'vitest';
import { P01_MAP_LAYER_IDS } from '../../foundation/urduRtlLanguage';
import { createUrduRtlLanguageFeatureCollection } from './urduRtlLanguageLayers';

describe('Urdu RTL language map layers', () => {
  it('creates city-scoped Urdu and Roman Urdu label data for P01 map layers', () => {
    const data = createUrduRtlLanguageFeatureCollection('karachi');

    expect(data.features).toHaveLength(1);
    expect(data.features[0].properties).toEqual({
      id: 'p01-karachi',
      title: 'کراچی',
      romanUrdu: 'Karachi',
      english: 'Karachi',
      direction: 'rtl',
    });
  });

  it('uses the public P01 map layer identifiers', () => {
    expect(P01_MAP_LAYER_IDS.primary).toBe('ciro-urdu-rtl-language-foundation-primary');
    expect(P01_MAP_LAYER_IDS.labels).toBe('ciro-urdu-rtl-language-foundation-labels');
  });
});
