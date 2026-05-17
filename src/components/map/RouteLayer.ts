import maplibregl from 'maplibre-gl';
import type { Resource } from '../../types';
import { getStatusColor } from '../../constants/colors';

const SOURCE_ID = 'unit-routes';
const LAYER_ID  = 'unit-routes-layer';

export function initRouteLayer(map: maplibregl.Map): void {
  if (map.getSource(SOURCE_ID)) return;
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 2,
      'line-dasharray': [4, 3],
      'line-opacity': 0.8,
    },
  });
}

export function updateRouteLayer(map: maplibregl.Map, resources: Resource[]): void {
  const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;

  const features = resources
    .filter((r) => (r.status === 'en_route' || r.status === 'dispatched') && r.targetPosition)
    .map((r) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [r.currentPosition.lng, r.currentPosition.lat],
          [r.targetPosition!.lng, r.targetPosition!.lat],
        ],
      },
      properties: { color: getStatusColor(r.status) },
    }));

  src.setData({ type: 'FeatureCollection', features });
}
