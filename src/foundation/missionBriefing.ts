import type { City } from '../types';

export const P04_SETTING_KEYS = {
  enabled: 'ciro.settings.triggered_mission_briefing_panel.enabled',
  mobileParity: 'ciro.settings.triggered_mission_briefing_panel.mobileParity',
  lastReviewedAt: 'ciro.settings.triggered_mission_briefing_panel.lastReviewedAt',
} as const;

export const P04_API_ROUTES = {
  status: '/api/triggered-mission-briefing-panel/status',
  simulate: '/api/triggered-mission-briefing-panel/simulate',
} as const;

export const P04_MAP_LAYER_IDS = {
  source: 'ciro-triggered-mission-briefing-panel-source',
  primary: 'ciro-triggered-mission-briefing-panel-primary',
  labels: 'ciro-triggered-mission-briefing-panel-labels',
} as const;

export type P04Status = 'idle' | 'checking' | 'ready' | 'fallback' | 'error';
export type P04MissionAction = 'simulate' | 'ai_dispatch';

export interface P04Settings {
  enabled: boolean;
  mobileParity: boolean;
  lastReviewedAt: string | null;
}

export interface P04BackendStatus {
  status: Exclude<P04Status, 'idle' | 'checking'>;
  checkedAt: string;
  backendReachable: boolean;
  mobileParity: boolean;
  message: string;
}

export interface P04SimulationRequest {
  city: City;
  requestedAt: string;
  source: 'settings' | 'startup' | 'operator';
  action: P04MissionAction;
}

export interface P04SimulationResponse {
  status: Exclude<P04Status, 'idle' | 'checking'>;
  simulatedAt: string;
  backendReachable: boolean;
  action: P04MissionAction;
  events: string[];
  message: string;
}

export const DEFAULT_P04_SETTINGS: P04Settings = {
  enabled: true,
  mobileParity: true,
  lastReviewedAt: null,
};

export function formatP04ActionLabel(action: P04MissionAction): string {
  return action === 'ai_dispatch' ? 'AI dispatch' : 'simulation';
}

export function createFallbackP04Status(nowIso: string): P04BackendStatus {
  return {
    status: 'fallback',
    checkedAt: nowIso,
    backendReachable: false,
    mobileParity: true,
    message: 'Using bundled P04 mission briefing contracts because no hosted backend is configured.',
  };
}

export function createFallbackP04Simulation(
  nowIso: string,
  action: P04MissionAction,
): P04SimulationResponse {
  return {
    status: 'fallback',
    simulatedAt: nowIso,
    backendReachable: false,
    action,
    events: [
      `Prepared operator briefing before ${formatP04ActionLabel(action)}`,
      'Exposed Start, Edit Scenario, and Cancel choices',
      'Skipped hosted backend because no safe API base is configured',
    ],
    message: 'P04 briefing used bundled mission fallback contracts.',
  };
}
