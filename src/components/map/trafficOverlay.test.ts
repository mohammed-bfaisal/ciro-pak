import { describe, expect, it } from 'vitest';
import type { TrafficFlow } from '../../api/traffic';
import type { Resource } from '../../types';
import { buildTrafficLineFeatureCollection } from './trafficOverlay';

const flow: TrafficFlow = {
  lat: 24.86,
  lng: 67.01,
  congestionLevel: 'heavy',
  currentSpeed: 18,
  freeFlowSpeed: 54,
  provider: 'google',
  updatedAt: '2026-05-20T12:00:00.000Z',
  trafficSegments: [
    { coords: [[67.0, 24.86], [67.02, 24.87]], congestionLevel: 'heavy' },
    { coords: [[67.02, 24.87], [67.04, 24.88]], congestionLevel: 'standstill' },
  ],
};

const resource = {
  id: 'unit-1',
  type: 'ambulance',
  label: 'Ambulance 1',
  status: 'en_route',
  location: { lat: 24.85, lng: 67.0, label: 'Station' },
  currentPosition: { lat: 24.85, lng: 67.0, label: 'Station' },
  targetPosition: { lat: 24.9, lng: 67.05, label: 'Incident' },
  assignedCrisisId: 'crisis-1',
  capacity: 2,
  currentLoad: 0,
  movementProgress: 0,
  routeTrafficSegments: [
    { coords: [[67.0, 24.85], [67.05, 24.9]], congestionLevel: 'free' },
  ],
} satisfies Resource;

describe('traffic overlay feature builder', () => {
  it('renders Google traffic as road-aligned line features from flow probes and active vehicle routes', () => {
    const collection = buildTrafficLineFeatureCollection([flow], [resource]);

    expect(collection.features).toHaveLength(3);
    expect(collection.features.map((feature) => feature.geometry.type)).toEqual(['LineString', 'LineString', 'LineString']);
    expect(collection.features.map((feature) => feature.properties?.congestion)).toEqual(['heavy', 'standstill', 'free']);
    expect(collection.features[0].geometry.coordinates).toEqual([[67.0, 24.86], [67.02, 24.87]]);
  });

  it('does not invent road geometry when a fallback flow has no Google route segments', () => {
    const collection = buildTrafficLineFeatureCollection([
      {
        ...flow,
        provider: 'simulated',
        trafficSegments: undefined,
      },
    ], []);

    expect(collection.features).toHaveLength(0);
  });
});
