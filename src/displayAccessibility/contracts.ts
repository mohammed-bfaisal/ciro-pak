export const DISPLAY_ACCESSIBILITY_SETTING_KEYS = {
  enabled: 'ciro.settings.display_accessibility_settings.enabled',
  mobileParity: 'ciro.settings.display_accessibility_settings.mobileParity',
  lastReviewedAt: 'ciro.settings.display_accessibility_settings.lastReviewedAt',
} as const;

export const DISPLAY_ACCESSIBILITY_API_ROUTES = {
  status: '/api/display-accessibility-settings/status',
  simulate: '/api/display-accessibility-settings/simulate',
} as const;

export const DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS = {
  source: 'ciro-display-accessibility-settings-source',
  primary: 'ciro-display-accessibility-settings-primary',
  labels: 'ciro-display-accessibility-settings-labels',
} as const;

export type P02Status = 'idle' | 'checking' | 'ready' | 'fallback' | 'error';
export type P02TextDensity = 'standard' | 'comfortable';

export interface P02Settings {
  enabled: boolean;
  mobileParity: boolean;
  lastReviewedAt: string | null;
}

export interface P02DisplayPreferences {
  textDensity: P02TextDensity;
  largeText: boolean;
  colorblindSafe: boolean;
}

export interface P02BackendStatus {
  status: Exclude<P02Status, 'idle' | 'checking'>;
  checkedAt: string;
  backendReachable: boolean;
  mobileParity: boolean;
  message: string;
}

export interface P02SimulationRequest {
  city: string;
  requestedAt: string;
  source: 'settings' | 'startup' | 'operator';
}

export interface P02SimulationResponse {
  status: Exclude<P02Status, 'idle' | 'checking'>;
  simulatedAt: string;
  backendReachable: boolean;
  events: string[];
  message: string;
}

export const DEFAULT_P02_SETTINGS: P02Settings = {
  enabled: false,
  mobileParity: true,
  lastReviewedAt: null,
};

export function resolveP02DisplayPreferences(settings: P02Settings): P02DisplayPreferences {
  if (!settings.enabled) {
    return {
      textDensity: 'standard',
      largeText: false,
      colorblindSafe: false,
    };
  }

  return {
    textDensity: 'comfortable',
    largeText: true,
    colorblindSafe: true,
  };
}

export function createFallbackP02Status(nowIso: string): P02BackendStatus {
  return {
    status: 'fallback',
    checkedAt: nowIso,
    backendReachable: false,
    mobileParity: true,
    message: 'Using bundled P02 display accessibility preferences because no hosted backend is configured.',
  };
}

export function createFallbackP02Simulation(nowIso: string): P02SimulationResponse {
  return {
    status: 'fallback',
    simulatedAt: nowIso,
    backendReachable: false,
    events: [
      'Applied larger text display preset',
      'Applied comfortable text density',
      'Applied colorblind-safe map layer identifiers',
      'Skipped hosted backend because no safe API base is configured',
    ],
    message: 'P02 simulation used bundled display accessibility preferences.',
  };
}
