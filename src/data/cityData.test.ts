import { describe, expect, it } from 'vitest';
import { ALL_CITIES } from './cities';
import { getCityData } from './cityData';

describe('city data coverage', () => {
  it('loads Challenge 3-complete data for every city', () => {
    for (const city of ALL_CITIES) {
      const data = getCityData(city);
      const sourceTypes = new Set(data.signals.map((signal) => signal.source));

      expect(data.signals.length).toBeGreaterThanOrEqual(8);
      expect(sourceTypes.size).toBeGreaterThanOrEqual(5);
      expect(sourceTypes.has('social')).toBe(true);
      expect(sourceTypes.has('weather')).toBe(true);
      expect(sourceTypes.has('traffic')).toBe(true);
      expect(sourceTypes.has('field_report')).toBe(true);
      expect(sourceTypes.has('sensor') || sourceTypes.has('emergency_call')).toBe(true);

      expect(data.resources.length).toBeGreaterThanOrEqual(6);
      expect(data.crises.length).toBeGreaterThanOrEqual(2);

      for (const crisis of data.crises) {
        expect(crisis.city).toBe(city);
        expect(crisis.signalIds.length).toBeGreaterThanOrEqual(3);
        expect(crisis.actions.length).toBeGreaterThanOrEqual(2);
        expect(crisis.stakeholderMessages.length).toBeGreaterThanOrEqual(2);
        expect(crisis.agentReasoning).toContain('Signal Fusion Analysis');
      }
    }
  });
});
