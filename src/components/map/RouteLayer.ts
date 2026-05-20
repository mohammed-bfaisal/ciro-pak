import maplibregl from 'maplibre-gl';
import type { Resource } from '../../types';
import { getStatusColor } from '../../constants/colors';

const SOURCE_ID = 'unit-routes';
const LAYER_ID  = 'unit-routes-layer';
const LABEL_SOURCE_ID = 'unit-routes-labels';
const LABEL_LAYER_ID  = 'unit-routes-label-layer';

export function initRouteLayer(map: maplibregl.Map): void {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }
  if (!map.getLayer(LAYER_ID)) {
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

  if (!map.getSource(LABEL_SOURCE_ID)) {
    map.addSource(LABEL_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }
  if (!map.getLayer(LABEL_LAYER_ID)) {
    map.addLayer({
      id: LABEL_LAYER_ID,
      type: 'symbol',
      source: LABEL_SOURCE_ID,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-anchor': 'center',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#f59e0b',
        'text-halo-color': '#111111',
        'text-halo-width': 1.5,
      },
    });
  }
}

export function updateRouteLayer(map: maplibregl.Map, resources: Resource[]): void {
  const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;

  const activeResources = resources.filter(
    (r) => (r.status === 'en_route' || r.status === 'dispatched') && r.targetPosition,
  );

  const features = activeResources.map((r) => {
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

  const labelSrc = map.getSource(LABEL_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!labelSrc) return;

  const labelFeatures = activeResources
    .filter((r) => r.distanceMeters != null && r.distanceMeters > 0)
    .map((r) => {
      const coords: [number, number][] = r.routeCoordinates && r.routeCoordinates.length > 1
        ? r.routeCoordinates
        : [
            [r.currentPosition.lng, r.currentPosition.lat],
            [r.targetPosition!.lng, r.targetPosition!.lat],
          ];
      const mid = coords[Math.floor(coords.length / 2)];
      const km = ((r.distanceMeters ?? 0) / 1000).toFixed(1);
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: mid },
        properties: { label: `${km} km` },
      };
    });

  labelSrc.setData({ type: 'FeatureCollection', features: labelFeatures });
}
