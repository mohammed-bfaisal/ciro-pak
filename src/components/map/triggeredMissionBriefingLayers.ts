import type maplibregl from 'maplibre-gl';
import { CITY_COORDS } from '../../constants/mapStyles';
import { CITY_REGISTRY } from '../../data/cities';
import { P04_MAP_LAYER_IDS } from '../../foundation/triggeredMissionBriefing';
import type { City } from '../../types';

export function createTriggeredMissionBriefingFeatureCollection(city: City): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const metadata = CITY_REGISTRY[city];

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
          title: 'Mission briefing',
          scenarioTitle: metadata.scenarioTitle,
          cityLabel: metadata.label,
        },
      },
    ],
  };
}

export function syncTriggeredMissionBriefingLayers(map: maplibregl.Map, city: City, enabled: boolean): void {
  if (!map.isStyleLoaded()) return;

  if (!enabled) {
    removeTriggeredMissionBriefingLayers(map);
    return;
  }

  const data = createTriggeredMissionBriefingFeatureCollection(city);
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
        'circle-radius': 13,
        'circle-color': '#22c55e',
        'circle-opacity': 0.16,
        'circle-stroke-color': '#86efac',
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
        'text-size': 11,
        'text-offset': [0, 1.6],
      },
      paint: {
        'text-color': '#bbf7d0',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    });
  }
}

export function removeTriggeredMissionBriefingLayers(map: maplibregl.Map): void {
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
