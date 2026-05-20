import { CITY_REGISTRY } from '../data/cities';
import { useCrisisStore } from '../store/crisisStore';
import { makeTrafficScopeKey } from '../store/liveDataStore';
import { useResourceStore } from '../store/resourceStore';
import type { City } from '../types';

export interface TrafficRefreshScope {
  key: string;
  lat: number;
  lng: number;
}

export function getTrafficRefreshScopes(city: City): TrafficRefreshScope[] {
  const resourceScopes = useResourceStore.getState().resources
    .filter((resource) => resource.status === 'en_route' && resource.targetPosition)
    .map((resource) => ({
      key: makeTrafficScopeKey(city, 'route', resource.id),
      lat: resource.currentPosition.lat,
      lng: resource.currentPosition.lng,
    }));

  const crisisScopes = useCrisisStore.getState().crises
    .filter((crisis) => crisis.status === 'active' || crisis.status === 'responding')
    .map((crisis) => ({
      key: makeTrafficScopeKey(city, 'crisis', crisis.id),
      lat: crisis.location.lat,
      lng: crisis.location.lng,
    }));

  const liveScopes = [...resourceScopes, ...crisisScopes];
  if (liveScopes.length > 0) return liveScopes;

  const [lng, lat] = CITY_REGISTRY[city].center;
  return [
    {
      key: makeTrafficScopeKey(city, 'city', 'center'),
      lat,
      lng,
    },
  ];
}
