import { CITY_REGISTRY } from '../data/cities';
import type { City, CrisisType } from '../types';

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
export type P04Trigger = 'simulation' | 'ai_dispatch';
export type P04OperatorChoice = 'start' | 'edit_scenario' | 'cancel';

export interface P04Settings {
  enabled: boolean;
  mobileParity: boolean;
  lastReviewedAt: string | null;
}

export interface MissionBriefing {
  id: string;
  city: City;
  cityLabel: string;
  province: string;
  scenarioTitle: string;
  trigger: P04Trigger;
  generatedAt: string;
  expectedCrises: CrisisType[];
  operatorChoices: P04OperatorChoice[];
  summary: string;
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
  trigger: P04Trigger;
}

export interface P04SimulationResponse {
  status: Exclude<P04Status, 'idle' | 'checking'>;
  simulatedAt: string;
  backendReachable: boolean;
  briefing: MissionBriefing;
  events: string[];
  message: string;
}

export const DEFAULT_P04_SETTINGS: P04Settings = {
  enabled: true,
  mobileParity: true,
  lastReviewedAt: null,
};

const P04_OPERATOR_CHOICES: P04OperatorChoice[] = ['start', 'edit_scenario', 'cancel'];

export function createMissionBriefing(
  city: City,
  trigger: P04Trigger,
  generatedAt: string,
): MissionBriefing {
  const metadata = CITY_REGISTRY[city];
  const expectedCrises = [...metadata.expectedCrises];

  return {
    id: `p04-${city}-${trigger}`,
    city,
    cityLabel: metadata.label,
    province: metadata.province,
    scenarioTitle: metadata.scenarioTitle,
    trigger,
    generatedAt,
    expectedCrises,
    operatorChoices: P04_OPERATOR_CHOICES,
    summary: `${metadata.label} mission briefing: ${metadata.scenarioTitle}. Expected incident classes: ${expectedCrises.join(', ')}.`,
  };
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
  trigger: P04Trigger,
  city: City,
): P04SimulationResponse {
  return {
    status: 'fallback',
    simulatedAt: nowIso,
    backendReachable: false,
    briefing: createMissionBriefing(city, trigger, nowIso),
    events: [
      'Prepared mission briefing from bundled scenario metadata',
      'Presented Start, Edit Scenario, and Cancel operator choices',
      'Skipped hosted backend because no safe API base is configured',
    ],
    message: 'P04 mission briefing used bundled fallback scenario metadata.',
  };
}
