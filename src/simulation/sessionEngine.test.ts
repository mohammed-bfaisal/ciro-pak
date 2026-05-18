import { describe, expect, it } from 'vitest';
import { getCityData } from '../data/cityData';
import { createLiveSimulation, advanceLiveSimulation, resolveIncident, missExpiredIncidents } from './sessionEngine';

describe('live 911 operator session engine', () => {
  it('reveals signals over time and activates incidents from supporting signals', () => {
    const cityData = getCityData('karachi');
    let state = createLiveSimulation('karachi', cityData);

    let result = advanceLiveSimulation(state, cityData, 1);
    expect(result.newSignals.length).toBeGreaterThan(0);
    expect(result.newCrises).toHaveLength(0);

    state = result.state;
    result = advanceLiveSimulation(state, cityData, 4);

    expect(result.state.elapsedMinutes).toBe(5);
    expect(result.state.revealedSignalIds.length).toBeGreaterThanOrEqual(5);
    expect(result.newCrises.length).toBeGreaterThanOrEqual(1);
    expect(result.traceEvents.at(-1)?.decision).toContain('promote');
  });

  it('updates score when incidents are resolved or missed', () => {
    const cityData = getCityData('karachi');
    const started = createLiveSimulation('karachi', cityData);
    const withIncident = advanceLiveSimulation(started, cityData, 6).state;
    const activeIncident = withIncident.incidents.find((incident) => incident.status === 'active');

    expect(activeIncident).toBeDefined();

    const resolved = resolveIncident(withIncident, activeIncident!.crisisId, 7);
    expect(resolved.score.handledIncidents).toBe(1);
    expect(resolved.score.publicTrust).toBeGreaterThan(withIncident.score.publicTrust);

    const expired = missExpiredIncidents({
      ...withIncident,
      elapsedMinutes: 999,
    });
    expect(expired.score.missedIncidents).toBeGreaterThanOrEqual(1);
    expect(expired.score.publicTrust).toBeLessThan(withIncident.score.publicTrust);
  });
});
