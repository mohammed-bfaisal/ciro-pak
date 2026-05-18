import type maplibregl from 'maplibre-gl';
import { CITY_COORDS } from '../../constants/mapStyles';
import { FOUNDATION_MAP_LAYER_IDS } from '../../foundation/contracts';
import type { City } from '../../types';

export function createFoundationFeatureCollection(city: City): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: CITY_COORDS[city].center,
        },
        properties: {
          id: `p00-${city}`,
          title: 'P00 backend contract anchor',
        },
      },
    ],
  };
}

export function syncFoundationLayers(map: maplibregl.Map, city: City, enabled: boolean): void {
  if (!map.isStyleLoaded()) return;

  if (!enabled) {
    removeFoundationLayers(map);
    return;
  }

  const data = createFoundationFeatureCollection(city);
  const existingSource = map.getSource(FOUNDATION_MAP_LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
  } else {
    map.addSource(FOUNDATION_MAP_LAYER_IDS.source, {
      type: 'geojson',
      data,
    });
  }

  if (!map.getLayer(FOUNDATION_MAP_LAYER_IDS.primary)) {
    map.addLayer({
      id: FOUNDATION_MAP_LAYER_IDS.primary,
      type: 'circle',
      source: FOUNDATION_MAP_LAYER_IDS.source,
      paint: {
        'circle-radius': 9,
        'circle-color': '#f59e0b',
        'circle-opacity': 0.22,
        'circle-stroke-color': '#f59e0b',
        'circle-stroke-width': 1,
      },
    });
  }

  if (!map.getLayer(FOUNDATION_MAP_LAYER_IDS.labels)) {
    map.addLayer({
      id: FOUNDATION_MAP_LAYER_IDS.labels,
      type: 'symbol',
      source: FOUNDATION_MAP_LAYER_IDS.source,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 10,
        'text-offset': [0, 1.2],
      },
      paint: {
        'text-color': '#fbbf24',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    });
  }
}

export function removeFoundationLayers(map: maplibregl.Map): void {
  if (map.getLayer(FOUNDATION_MAP_LAYER_IDS.labels)) {
    map.removeLayer(FOUNDATION_MAP_LAYER_IDS.labels);
  }
  if (map.getLayer(FOUNDATION_MAP_LAYER_IDS.primary)) {
    map.removeLayer(FOUNDATION_MAP_LAYER_IDS.primary);
  }
  if (map.getSource(FOUNDATION_MAP_LAYER_IDS.source)) {
    map.removeSource(FOUNDATION_MAP_LAYER_IDS.source);
  }
}
