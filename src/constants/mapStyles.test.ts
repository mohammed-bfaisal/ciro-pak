import { describe, expect, it } from 'vitest';
import { buildGoogleRasterStyle } from './mapStyles';

describe('map style helpers', () => {
  it('builds a MapLibre raster style from a proxied backend tile URL only', () => {
    const style = buildGoogleRasterStyle(
      'https://backend.example/api/map-tiles/tiles/satellite/{z}/{x}/{y}',
      'Map data (c) Google',
      'satellite',
    );

    expect(style.sources['google-map-tiles'].tiles).toEqual([
      'https://backend.example/api/map-tiles/tiles/satellite/{z}/{x}/{y}',
    ]);
    expect(JSON.stringify(style)).not.toContain('AIza');
    expect(style.layers[0]).toMatchObject({
      id: 'google-map-tiles-layer',
      type: 'raster',
      source: 'google-map-tiles',
    });
  });
});
