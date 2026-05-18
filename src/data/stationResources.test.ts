import { describe, expect, it } from 'vitest';
import { ALL_CITIES } from './cities';
import { getStationResources } from './stationResources';

const REQUIRED_TYPES = [
  'ambulance',
  'police_unit',
  'rescue_team',
  'fire_truck',
  'medical_outreach',
  'water_tanker',
  'drone',
] as const;

describe('station-backed resources', () => {
  it('provides sourced real-location resources for every city and resource type', () => {
    ALL_CITIES.forEach((city) => {
      const resources = getStationResources(city);
      const types = new Set(resources.map((resource) => resource.type));

      REQUIRED_TYPES.forEach((type) => expect(types.has(type), `${city} missing ${type}`).toBe(true));
      expect(resources.length).toBeGreaterThanOrEqual(REQUIRED_TYPES.length);

      resources.forEach((resource) => {
        expect(resource.location.label.length).toBeGreaterThan(3);
        expect(resource.location.lat).toBeGreaterThan(20);
        expect(resource.location.lng).toBeGreaterThan(60);
        expect(resource.source).toBe('OpenStreetMap/Overpass snapshot');
        expect(resource.sourceId).toMatch(/^(node|way|relation)\//);
        expect(resource.sourceConfidence).toBeGreaterThanOrEqual(0.6);
        expect(resource.sourceUpdatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    });
  });
});
