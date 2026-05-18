export const FOUNDATION_SETTING_KEYS = {
  enabled: 'ciro.settings.foundation_settings_backend_contracts.enabled',
  mobileParity: 'ciro.settings.foundation_settings_backend_contracts.mobileParity',
  lastReviewedAt: 'ciro.settings.foundation_settings_backend_contracts.lastReviewedAt',
} as const;

export const FOUNDATION_API_ROUTES = {
  status: '/api/foundation-settings-backend-contracts/status',
  simulate: '/api/foundation-settings-backend-contracts/simulate',
} as const;

export const FOUNDATION_MAP_LAYER_IDS = {
  source: 'ciro-foundation-settings-backend-contracts-source',
  primary: 'ciro-foundation-settings-backend-contracts-primary',
  labels: 'ciro-foundation-settings-backend-contracts-labels',
} as const;

export type P00Status = 'idle' | 'checking' | 'ready' | 'fallback' | 'error';

export interface P00Settings {
  enabled: boolean;
  mobileParity: boolean;
  lastReviewedAt: string | null;
}

export interface P00BackendStatus {
  status: Exclude<P00Status, 'idle' | 'checking'>;
  checkedAt: string;
  backendReachable: boolean;
  mobileParity: boolean;
  message: string;
}

export interface P00SimulationRequest {
  city: string;
  requestedAt: string;
  source: 'settings' | 'startup' | 'operator';
}

export interface P00SimulationResponse {
  status: Exclude<P00Status, 'idle' | 'checking'>;
  simulatedAt: string;
  backendReachable: boolean;
  events: string[];
  message: string;
}

export const DEFAULT_P00_SETTINGS: P00Settings = {
  enabled: true,
  mobileParity: true,
  lastReviewedAt: null,
};

export function createFallbackP00Status(nowIso: string): P00BackendStatus {
  return {
    status: 'fallback',
    checkedAt: nowIso,
    backendReachable: false,
    mobileParity: true,
    message: 'Using bundled P00 foundation contracts because no hosted backend is configured.',
  };
}

export function createFallbackP00Simulation(nowIso: string): P00SimulationResponse {
  return {
    status: 'fallback',
    simulatedAt: nowIso,
    backendReachable: false,
    events: [
      'Loaded non-secret settings contract',
      'Confirmed bundled fallback path',
      'Skipped hosted backend because no safe API base is configured',
    ],
    message: 'P00 simulation used bundled fallback contracts.',
  };
}
