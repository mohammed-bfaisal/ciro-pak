import { apiFetch, type ApiClientOptions } from './client';

export interface BackendHealth {
  status: 'ok';
  service: string;
  appVersion: string;
  timestamp: string;
  providers: {
    weather: 'openweathermap' | 'simulated';
    traffic: 'google_routes' | 'simulated';
    routing: 'google_routes' | 'osrm';
    openrouter: 'openrouter' | 'disabled';
    speech: 'openrouter' | 'disabled';
    mapTiles: 'google_map_tiles' | 'disabled';
  };
  features: {
    weatherProxy: boolean;
    trafficProxy: boolean;
    routingProxy: boolean;
    openrouterProxy: boolean;
    speechProxy: boolean;
    mapTilesProxy: boolean;
  };
}

export async function fetchBackendHealth(options: ApiClientOptions = {}): Promise<BackendHealth | null> {
  try {
    return await apiFetch<BackendHealth>('/api/health', {}, options);
  } catch {
    return null;
  }
}
