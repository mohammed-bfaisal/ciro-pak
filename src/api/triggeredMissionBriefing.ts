import {
  P04_API_ROUTES,
  createFallbackP04Simulation,
  createFallbackP04Status,
  type P04BackendStatus,
  type P04SimulationRequest,
  type P04SimulationResponse,
} from '../foundation/triggeredMissionBriefing';
import { getBackendBaseUrl } from './backendConfig';

interface P04ApiOptions {
  baseUrl?: string | null;
  fetcher?: typeof fetch;
  now?: () => Date;
}

interface P04SimulationOptions extends P04ApiOptions {
  request: P04SimulationRequest;
}

function joinApiUrl(baseUrl: string, route: string): string {
  return `${baseUrl}${route}`;
}

export async function checkTriggeredMissionBriefingStatus(
  options: P04ApiOptions = {},
): Promise<P04BackendStatus> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP04Status(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, P04_API_ROUTES.status), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return createFallbackP04Status(nowIso);
    return await response.json() as P04BackendStatus;
  } catch {
    return createFallbackP04Status(nowIso);
  }
}

export async function simulateTriggeredMissionBriefing(
  options: P04SimulationOptions,
): Promise<P04SimulationResponse> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP04Simulation(nowIso, options.request.trigger, options.request.city);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, P04_API_ROUTES.simulate), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.request),
    });
    if (!response.ok) return createFallbackP04Simulation(nowIso, options.request.trigger, options.request.city);
    return await response.json() as P04SimulationResponse;
  } catch {
    return createFallbackP04Simulation(nowIso, options.request.trigger, options.request.city);
  }
}
