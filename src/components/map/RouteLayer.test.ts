import { describe, expect, it } from 'vitest';
import type maplibregl from 'maplibre-gl';
import { initRouteLayer, updateRouteLayer } from './RouteLayer';
import type { Resource } from '../../types';
import { ALL_CITIES } from '../../data/cities';
import { getCityData } from '../../data/cityData';

interface CapturedRouteFeature {
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

describe('RouteLayer', () => {
  it('restores the route layer when the GeoJSON source exists but the layer was removed by a style change', () => {
    const addedLayers: string[] = [];
    const map = {
      getSource: () => ({ setData: () => undefined }),
      getLayer: () => undefined,
      addLayer: (layer: { id: string }) => {
        addedLayers.push(layer.id);
      },
    } as unknown as maplibregl.Map;

    initRouteLayer(map);

    expect(addedLayers).toEqual(['unit-routes-layer', 'unit-routes-label-layer']);
  });

  it('leaves dispatch routes below traffic overlays after updating route data', () => {
    const source = { setData: () => undefined };
    const movedLayers: string[] = [];
    const map = {
      getSource: () => source,
      getLayer: () => true,
      moveLayer: (layerId: string) => {
        movedLayers.push(layerId);
      },
    } as unknown as maplibregl.Map;

    updateRouteLayer(map, [makeEnRouteResource()]);

    expect(movedLayers).not.toContain('unit-routes-layer');
  });

  it('emits a drawable route feature for every supported city', () => {
    for (const city of ALL_CITIES) {
      let routeFeatures: CapturedRouteFeature[] = [];
      const routeSource = {
        setData: (data: { features: CapturedRouteFeature[] }) => {
          routeFeatures = data.features;
        },
      };
      const labelSource = { setData: () => undefined };
      const map = {
        getSource: (id: string) => id === 'unit-routes' ? routeSource : labelSource,
        getLayer: () => true,
        moveLayer: () => undefined,
      } as unknown as maplibregl.Map;
      const cityData = getCityData(city);
      const resource = cityData.resources[0];
      const crisis = cityData.crises[0];

      updateRouteLayer(map, [{
        ...resource,
        status: 'en_route',
        assignedCrisisId: crisis.id,
        targetPosition: crisis.location,
      }]);

      expect(routeFeatures, city).toHaveLength(1);
      const feature = routeFeatures[0];
      expect(feature.geometry.type, city).toBe('LineString');
      const coordinates = feature.geometry.coordinates;
      expect(coordinates, city).toHaveLength(2);
      expect(coordinates.every(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat)), city).toBe(true);
    }
  });
});

function makeEnRouteResource(): Resource {
  return {
    id: 'unit-1',
    type: 'ambulance',
    label: 'Unit 1',
    status: 'en_route',
    location: { lat: 33.69, lng: 73.04, label: 'Station' },
    assignedCrisisId: 'crisis-1',
    etaSeconds: 300,
    etaMinutes: 5,
    capacity: 4,
    currentLoad: 0,
    currentPosition: { lat: 33.69, lng: 73.04, label: 'Station' },
    targetPosition: { lat: 33.7, lng: 73.05, label: 'Incident' },
    movementProgress: 0,
    routeCoordinates: [
      [73.04, 33.69],
      [73.05, 33.7],
    ],
  };
}
