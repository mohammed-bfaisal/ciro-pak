import { describe, expect, it } from 'vitest';
import { ALL_CITIES, CITY_REGISTRY } from './cities';

const REQUIRED_CITIES = [
  'karachi',
  'islamabad',
  'lahore',
  'rawalpindi',
  'faisalabad',
  'multan',
  'gujranwala',
  'sialkot',
  'bahawalpur',
  'sargodha',
  'peshawar',
  'abbottabad',
  'quetta',
  'gwadar',
  'hyderabad',
  'sukkur',
] as const;

describe('city registry', () => {
  it('contains every Challenge 3 city exactly once', () => {
    expect(ALL_CITIES).toEqual(REQUIRED_CITIES);
    expect(Object.keys(CITY_REGISTRY).sort()).toEqual([...REQUIRED_CITIES].sort());
  });

  it('has map, population, weather, and scenario metadata for every city', () => {
    for (const city of REQUIRED_CITIES) {
      const metadata = CITY_REGISTRY[city];

      expect(metadata.label.length).toBeGreaterThan(2);
      expect(metadata.province.length).toBeGreaterThan(2);
      expect(metadata.population).toBeGreaterThan(100_000);
      expect(metadata.weatherQuery.length).toBeGreaterThan(2);
      expect(metadata.center).toHaveLength(2);
      expect(metadata.center[0]).toBeGreaterThan(60);
      expect(metadata.center[1]).toBeGreaterThan(20);
      expect(metadata.scenarioTitle.length).toBeGreaterThan(8);
      expect(metadata.expectedCrises.length).toBeGreaterThanOrEqual(2);
    }
  });
});
