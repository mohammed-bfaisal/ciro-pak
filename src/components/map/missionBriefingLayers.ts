import type maplibregl from 'maplibre-gl';
import { CITY_COORDS } from '../../constants/mapStyles';
import { P04_MAP_LAYER_IDS } from '../../foundation/missionBriefing';
import type { City } from '../../types';

export function createMissionBriefingFeatureCollection(city: City): GeoJSON.FeatureCollection<GeoJSON.Point> {
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
          id: `p04-${city}`,
          title: 'P04 mission briefing ready',
        },
      },
    ],
  };
}

export function syncMissionBriefingLayers(map: maplibregl.Map, city: City, enabled: boolean): void {
  if (!map.isStyleLoaded()) return;

  if (!enabled) {
    removeMissionBriefingLayers(map);
    return;
  }

  const data = createMissionBriefingFeatureCollection(city);
  const existingSource = map.getSource(P04_MAP_LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
  } else {
    map.addSource(P04_MAP_LAYER_IDS.source, {
      type: 'geojson',
      data,
    });
  }

  if (!map.getLayer(P04_MAP_LAYER_IDS.primary)) {
    map.addLayer({
      id: P04_MAP_LAYER_IDS.primary,
      type: 'circle',
      source: P04_MAP_LAYER_IDS.source,
      paint: {
        'circle-radius': 15,
        'circle-color': '#60a5fa',
        'circle-opacity': 0.14,
        'circle-stroke-color': '#f59e0b',
        'circle-stroke-width': 1,
      },
    });
  }

  if (!map.getLayer(P04_MAP_LAYER_IDS.labels)) {
    map.addLayer({
      id: P04_MAP_LAYER_IDS.labels,
      type: 'symbol',
      source: P04_MAP_LAYER_IDS.source,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 10,
        'text-offset': [0, 1.6],
      },
      paint: {
        'text-color': '#93c5fd',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    });
  }
}

export function removeMissionBriefingLayers(map: maplibregl.Map): void {
  if (map.getLayer(P04_MAP_LAYER_IDS.labels)) {
    map.removeLayer(P04_MAP_LAYER_IDS.labels);
  }
  if (map.getLayer(P04_MAP_LAYER_IDS.primary)) {
    map.removeLayer(P04_MAP_LAYER_IDS.primary);
  }
  if (map.getSource(P04_MAP_LAYER_IDS.source)) {
    map.removeSource(P04_MAP_LAYER_IDS.source);
  }
}
