import maplibregl from 'maplibre-gl';
import type { Resource } from '../../types';
import { getStatusColor } from '../../constants/colors';

const SOURCE_ID  = 'unit-routes';
const GLOW_ID    = 'unit-routes-glow';
const LAYER_ID   = 'unit-routes-layer';

export function initRouteLayer(map: maplibregl.Map): void {
  if (map.getSource(SOURCE_ID)) return;
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  // Wide soft glow under the dashed line — visible at city-level zoom
  map.addLayer({
    id: GLOW_ID,
    type: 'line',
    source: SOURCE_ID,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 7,
      'line-opacity': 0.18,
      'line-blur': 4,
    },
  });
  // Crisp dashed route line on top
  map.addLayer({
    id: LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 3,
      'line-dasharray': [4, 3],
      'line-opacity': 0.92,
    },
  });
}

export function updateRouteLayer(map: maplibregl.Map, resources: Resource[]): void {
  const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;

  const features = resources
    .filter((r) => (r.status === 'en_route' || r.status === 'dispatched') && r.targetPosition)
    .map((r) => {
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

  // Always keep route layers on top of signals/crisis/traffic overlays
  if (map.getLayer(GLOW_ID))  map.moveLayer(GLOW_ID);
  if (map.getLayer(LAYER_ID)) map.moveLayer(LAYER_ID);
}
