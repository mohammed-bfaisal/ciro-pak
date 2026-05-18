import {
  FOUNDATION_API_ROUTES,
  createFallbackP00Simulation,
  createFallbackP00Status,
  type P00BackendStatus,
  type P00SimulationRequest,
  type P00SimulationResponse,
} from '../foundation/contracts';
import { getBackendBaseUrl } from './backendConfig';

interface P00ApiOptions {
  baseUrl?: string | null;
  fetcher?: typeof fetch;
  now?: () => Date;
}

interface P00SimulationOptions extends P00ApiOptions {
  request: P00SimulationRequest;
}

function joinApiUrl(baseUrl: string, route: string): string {
  return `${baseUrl}${route}`;
}

export async function checkFoundationStatus(options: P00ApiOptions = {}): Promise<P00BackendStatus> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP00Status(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, FOUNDATION_API_ROUTES.status), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return createFallbackP00Status(nowIso);
    return await response.json() as P00BackendStatus;
  } catch {
    return createFallbackP00Status(nowIso);
  }
}

export async function simulateFoundationContracts(
  options: P00SimulationOptions,
): Promise<P00SimulationResponse> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP00Simulation(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, FOUNDATION_API_ROUTES.simulate), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.request),
    });
    if (!response.ok) return createFallbackP00Simulation(nowIso);
    return await response.json() as P00SimulationResponse;
  } catch {
    return createFallbackP00Simulation(nowIso);
  }
}
