import type maplibregl from 'maplibre-gl';
import { CITY_COORDS } from '../../constants/mapStyles';
import { DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS } from '../../displayAccessibility/contracts';
import type { City } from '../../types';

export function createDisplayAccessibilityFeatureCollection(city: City): GeoJSON.FeatureCollection<GeoJSON.Point> {
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
          id: `p02-${city}`,
          title: 'P02 accessible display anchor',
        },
      },
    ],
  };
}

export function syncDisplayAccessibilityLayers(map: maplibregl.Map, city: City, enabled: boolean): void {
  if (!map.isStyleLoaded()) return;

  if (!enabled) {
    removeDisplayAccessibilityLayers(map);
    return;
  }

  const data = createDisplayAccessibilityFeatureCollection(city);
  const existingSource = map.getSource(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
  } else {
    map.addSource(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.source, {
      type: 'geojson',
      data,
    });
  }

  if (!map.getLayer(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.primary)) {
    map.addLayer({
      id: DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.primary,
      type: 'circle',
      source: DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.source,
      paint: {
        'circle-radius': 12,
        'circle-color': '#56b4e9',
        'circle-opacity': 0.22,
        'circle-stroke-color': '#f0e442',
        'circle-stroke-width': 2,
      },
    });
  }

  if (!map.getLayer(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.labels)) {
    map.addLayer({
      id: DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.labels,
      type: 'symbol',
      source: DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.source,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 12,
        'text-offset': [0, 1.4],
      },
      paint: {
        'text-color': '#f0e442',
        'text-halo-color': '#080808',
        'text-halo-width': 1.25,
      },
    });
  }
}

export function removeDisplayAccessibilityLayers(map: maplibregl.Map): void {
  if (map.getLayer(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.labels)) {
    map.removeLayer(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.labels);
  }
  if (map.getLayer(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.primary)) {
    map.removeLayer(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.primary);
  }
  if (map.getSource(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.source)) {
    map.removeSource(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.source);
  }
}
