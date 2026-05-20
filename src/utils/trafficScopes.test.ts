import { afterEach, describe, expect, it } from 'vitest';
import { getCityData } from '../data/cityData';
import { useCrisisStore } from '../store/crisisStore';
import { useResourceStore } from '../store/resourceStore';
import { makeTrafficScopeKey } from '../store/liveDataStore';
import { getTrafficRefreshScopes } from './trafficScopes';

describe('traffic refresh scopes', () => {
  afterEach(() => {
    useCrisisStore.getState().reset();
    useResourceStore.getState().reset();
  });

  it('returns city arterial backend traffic probes when no crisis or route scopes exist', () => {
    const scopes = getTrafficRefreshScopes('islamabad');

    expect(scopes).toHaveLength(5);
    expect(scopes[0]).toEqual({
      key: makeTrafficScopeKey('islamabad', 'city', 'center'),
      lat: 33.6844,
      lng: 73.0479,
    });
    expect(scopes.map((scope) => scope.key)).toEqual([
      'islamabad:city:center',
      'islamabad:city:north',
      'islamabad:city:south',
      'islamabad:city:east',
      'islamabad:city:west',
    ]);
  });

  it('uses live crisis and route scopes once the scenario has actionable data', () => {
    const cityData = getCityData('karachi');
    const crisis = cityData.crises[0];
    const resource = {
      ...cityData.resources[0],
      status: 'en_route' as const,
      targetPosition: crisis.location,
    };

    useCrisisStore.getState().addCrisis(crisis);
    useResourceStore.getState().setResources([resource]);

    const scopes = getTrafficRefreshScopes('karachi');

    expect(scopes).toContainEqual({
      key: makeTrafficScopeKey('karachi', 'route', resource.id),
      lat: resource.currentPosition.lat,
      lng: resource.currentPosition.lng,
    });
    expect(scopes).toContainEqual({
      key: makeTrafficScopeKey('karachi', 'crisis', crisis.id),
      lat: crisis.location.lat,
      lng: crisis.location.lng,
    });
    expect(scopes.some((scope) => scope.key === makeTrafficScopeKey('karachi', 'city', 'center'))).toBe(true);
  });
});
