import { describe, expect, it } from 'vitest';
import {
  DEFAULT_P04_SETTINGS,
  P04_API_ROUTES,
  P04_MAP_LAYER_IDS,
  P04_SETTING_KEYS,
  createFallbackP04Simulation,
  createFallbackP04Status,
  createMissionBriefing,
} from './triggeredMissionBriefing';

describe('P04 triggered mission briefing contracts', () => {
  it('exports the exact public setting keys from the HTML implementation plan', () => {
    expect(P04_SETTING_KEYS).toEqual({
      enabled: 'ciro.settings.triggered_mission_briefing_panel.enabled',
      mobileParity: 'ciro.settings.triggered_mission_briefing_panel.mobileParity',
      lastReviewedAt: 'ciro.settings.triggered_mission_briefing_panel.lastReviewedAt',
    });
  });

  it('exports the exact backend routes and stable map layer ids', () => {
    expect(P04_API_ROUTES.status).toBe('/api/triggered-mission-briefing-panel/status');
    expect(P04_API_ROUTES.simulate).toBe('/api/triggered-mission-briefing-panel/simulate');
    expect(P04_MAP_LAYER_IDS.primary).toBe('ciro-triggered-mission-briefing-panel-primary');
    expect(P04_MAP_LAYER_IDS.labels).toBe('ciro-triggered-mission-briefing-panel-labels');
  });

  it('defaults to enabled non-secret settings and an offline-safe fallback status', () => {
    expect(DEFAULT_P04_SETTINGS).toEqual({
      enabled: true,
      mobileParity: true,
      lastReviewedAt: null,
    });

    expect(createFallbackP04Status('2026-05-19T08:00:00.000Z')).toEqual({
      status: 'fallback',
      checkedAt: '2026-05-19T08:00:00.000Z',
      backendReachable: false,
      mobileParity: true,
      message: 'Using bundled P04 mission briefing contracts because no hosted backend is configured.',
    });
  });

  it('creates a city briefing with the required operator choices before simulation or AI dispatch', () => {
    expect(createMissionBriefing('karachi', 'simulation', '2026-05-19T08:00:00.000Z')).toEqual({
      id: 'p04-karachi-simulation',
      city: 'karachi',
      cityLabel: 'Karachi',
      province: 'Sindh',
      scenarioTitle: 'Flood breach and heat emergency',
      trigger: 'simulation',
      generatedAt: '2026-05-19T08:00:00.000Z',
      expectedCrises: ['flood', 'heatwave'],
      operatorChoices: ['start', 'edit_scenario', 'cancel'],
      summary: 'Karachi mission briefing: Flood breach and heat emergency. Expected incident classes: flood, heatwave.',
    });
  });

  it('provides bundled fallback simulation responses without provider credentials', () => {
    const response = createFallbackP04Simulation('2026-05-19T08:00:00.000Z', 'ai_dispatch', 'lahore');

    expect(response.status).toBe('fallback');
    expect(response.briefing.operatorChoices).toEqual(['start', 'edit_scenario', 'cancel']);
    expect(response.events).toEqual([
      'Prepared mission briefing from bundled scenario metadata',
      'Presented Start, Edit Scenario, and Cancel operator choices',
      'Skipped hosted backend because no safe API base is configured',
    ]);
    expect(JSON.stringify(response)).not.toMatch(/api key|secret|token/i);
  });
});
