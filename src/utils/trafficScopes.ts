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
  return [...liveScopes, ...getCityArterialScopes(city)];
}

function getCityArterialScopes(city: City): TrafficRefreshScope[] {
  const [lng, lat] = CITY_REGISTRY[city].center;
  const lngOffset = 0.025 / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
  const latOffset = 0.018;
  return [
    {
      key: makeTrafficScopeKey(city, 'city', 'center'),
      lat,
      lng,
    },
    {
      key: makeTrafficScopeKey(city, 'city', 'north'),
      lat: lat + latOffset,
      lng,
    },
    {
      key: makeTrafficScopeKey(city, 'city', 'south'),
      lat: lat - latOffset,
      lng,
    },
    {
      key: makeTrafficScopeKey(city, 'city', 'east'),
      lat,
      lng: lng + lngOffset,
    },
    {
      key: makeTrafficScopeKey(city, 'city', 'west'),
      lat,
      lng: lng - lngOffset,
    },
  ];
}
