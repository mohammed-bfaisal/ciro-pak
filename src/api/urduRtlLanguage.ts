import {
  P01_API_ROUTES,
  createFallbackP01Simulation,
  createFallbackP01Status,
  type P01BackendStatus,
  type P01SimulationRequest,
  type P01SimulationResponse,
} from '../foundation/urduRtlLanguage';
import { getBackendBaseUrl } from './backendConfig';

interface P01ApiOptions {
  baseUrl?: string | null;
  fetcher?: typeof fetch;
  now?: () => Date;
}

interface P01SimulationOptions extends P01ApiOptions {
  request: P01SimulationRequest;
}

function joinApiUrl(baseUrl: string, route: string): string {
  return `${baseUrl}${route}`;
}

export async function checkUrduRtlLanguageStatus(options: P01ApiOptions = {}): Promise<P01BackendStatus> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP01Status(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, P01_API_ROUTES.status), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return createFallbackP01Status(nowIso);
    return await response.json() as P01BackendStatus;
  } catch {
    return createFallbackP01Status(nowIso);
  }
}

export async function simulateUrduRtlLanguage(
  options: P01SimulationOptions,
): Promise<P01SimulationResponse> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP01Simulation(nowIso, options.request.mode);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, P01_API_ROUTES.simulate), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.request),
    });
    if (!response.ok) return createFallbackP01Simulation(nowIso, options.request.mode);
    return await response.json() as P01SimulationResponse;
  } catch {
    return createFallbackP01Simulation(nowIso, options.request.mode);
  }
}
