import { CITY_REGISTRY } from '../data/cities';
import type { MapTileMode } from '../api/mapTiles';

export const DARK_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';

export const CITY_COORDS = Object.fromEntries(
  Object.entries(CITY_REGISTRY).map(([city, metadata]) => [
    city,
    {
      center: metadata.center,
      zoom: metadata.zoom,
      label: metadata.label,
    },
  ])
) as {
  [K in keyof typeof CITY_REGISTRY]: {
    center: [number, number];
    zoom: number;
    label: string;
  };
};

export function buildGoogleRasterStyle(
  tileUrl: string,
  attribution: string,
  mode: MapTileMode,
) {
  return {
    version: 8 as const,
    name: `CIRO Google ${mode}`,
    sources: {
      'google-map-tiles': {
        type: 'raster' as const,
        tiles: [tileUrl],
        tileSize: 256,
        attribution,
        maxzoom: 22,
      },
    },
    layers: [
      {
        id: 'google-map-tiles-layer',
        type: 'raster' as const,
        source: 'google-map-tiles',
        paint: {
          'raster-opacity': 1,
        },
      },
    ],
  };
}
