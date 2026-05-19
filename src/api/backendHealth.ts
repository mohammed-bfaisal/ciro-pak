import { apiFetch, type ApiClientOptions } from './client';

export interface BackendHealth {
  status: 'ok';
  service: string;
  timestamp: string;
  features: {
    weatherProxy: boolean;
    trafficProxy: boolean;
    routingProxy: boolean;
  };
}

export async function fetchBackendHealth(options: ApiClientOptions = {}): Promise<BackendHealth | null> {
  try {
    return await apiFetch<BackendHealth>('/api/health', {}, options);
  } catch {
    return null;
  }
}
