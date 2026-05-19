import {
  DISPLAY_ACCESSIBILITY_API_ROUTES,
  createFallbackP02Simulation,
  createFallbackP02Status,
  type P02BackendStatus,
  type P02SimulationRequest,
  type P02SimulationResponse,
} from '../displayAccessibility/contracts';
import { getBackendBaseUrl } from './backendConfig';

interface P02ApiOptions {
  baseUrl?: string | null;
  fetcher?: typeof fetch;
  now?: () => Date;
}

interface P02SimulationOptions extends P02ApiOptions {
  request: P02SimulationRequest;
}

function joinApiUrl(baseUrl: string, route: string): string {
  return `${baseUrl}${route}`;
}

export async function checkDisplayAccessibilityStatus(
  options: P02ApiOptions = {},
): Promise<P02BackendStatus> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP02Status(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, DISPLAY_ACCESSIBILITY_API_ROUTES.status), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return createFallbackP02Status(nowIso);
    return await response.json() as P02BackendStatus;
  } catch {
    return createFallbackP02Status(nowIso);
  }
}

export async function simulateDisplayAccessibilitySettings(
  options: P02SimulationOptions,
): Promise<P02SimulationResponse> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP02Simulation(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, DISPLAY_ACCESSIBILITY_API_ROUTES.simulate), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.request),
    });
    if (!response.ok) return createFallbackP02Simulation(nowIso);
    return await response.json() as P02SimulationResponse;
  } catch {
    return createFallbackP02Simulation(nowIso);
  }
}
