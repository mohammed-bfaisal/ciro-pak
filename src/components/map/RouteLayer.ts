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
      'line-width': 2.5,
      'line-dasharray': [4, 3],
      'line-opacity': 0.85,
    },
  });
}

export function updateRouteLayer(map: maplibregl.Map, resources: Resource[]): void {
  const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;

  const features = resources
    .filter((r) => (r.status === 'en_route' || r.status === 'dispatched') && r.targetPosition)
    .map((r) => {
      // Use real road route if available, fall back to straight line
      const coordinates: [number, number][] = r.routeCoordinates && r.routeCoordinates.length > 1
        ? r.routeCoordinates
        : [
            [r.currentPosition.lng, r.currentPosition.lat],
            [r.targetPosition!.lng, r.targetPosition!.lat],
          ];

      return {
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates },
        properties: { color: getStatusColor(r.status) },
      };
    });

  src.setData({ type: 'FeatureCollection', features });
  if (map.getLayer(LAYER_ID)) {
    map.moveLayer(LAYER_ID);
  }
}
