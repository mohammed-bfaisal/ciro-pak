import type maplibregl from 'maplibre-gl';
import { CITY_COORDS } from '../../constants/mapStyles';
import { getP01CityLabel, P01_MAP_LAYER_IDS } from '../../foundation/urduRtlLanguage';
import type { City } from '../../types';

export function createUrduRtlLanguageFeatureCollection(city: City): GeoJSON.FeatureCollection<GeoJSON.Point> {
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
          id: `p01-${city}`,
          title: getP01CityLabel(city, 'urdu'),
          romanUrdu: getP01CityLabel(city, 'romanUrdu'),
          english: getP01CityLabel(city, 'english'),
          direction: 'rtl',
        },
      },
    ],
  };
}

export function syncUrduRtlLanguageLayers(map: maplibregl.Map, city: City, enabled: boolean): void {
  if (!map.isStyleLoaded()) return;

  if (!enabled) {
    removeUrduRtlLanguageLayers(map);
    return;
  }

  const data = createUrduRtlLanguageFeatureCollection(city);
  const existingSource = map.getSource(P01_MAP_LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
  } else {
    map.addSource(P01_MAP_LAYER_IDS.source, {
      type: 'geojson',
      data,
    });
  }

  if (!map.getLayer(P01_MAP_LAYER_IDS.primary)) {
    map.addLayer({
      id: P01_MAP_LAYER_IDS.primary,
      type: 'circle',
      source: P01_MAP_LAYER_IDS.source,
      paint: {
        'circle-radius': 11,
        'circle-color': '#60a5fa',
        'circle-opacity': 0.18,
        'circle-stroke-color': '#93c5fd',
        'circle-stroke-width': 1,
      },
    });
  }

  if (!map.getLayer(P01_MAP_LAYER_IDS.labels)) {
    map.addLayer({
      id: P01_MAP_LAYER_IDS.labels,
      type: 'symbol',
      source: P01_MAP_LAYER_IDS.source,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 13,
        'text-offset': [0, -1.4],
        'text-justify': 'right',
      },
      paint: {
        'text-color': '#bfdbfe',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    });
  }
}

export function removeUrduRtlLanguageLayers(map: maplibregl.Map): void {
  if (map.getLayer(P01_MAP_LAYER_IDS.labels)) {
    map.removeLayer(P01_MAP_LAYER_IDS.labels);
  }
  if (map.getLayer(P01_MAP_LAYER_IDS.primary)) {
    map.removeLayer(P01_MAP_LAYER_IDS.primary);
  }
  if (map.getSource(P01_MAP_LAYER_IDS.source)) {
    map.removeSource(P01_MAP_LAYER_IDS.source);
  }
}
