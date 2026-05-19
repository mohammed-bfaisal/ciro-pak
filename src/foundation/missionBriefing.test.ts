import { describe, expect, it } from 'vitest';
import {
  DEFAULT_P04_SETTINGS,
  P04_API_ROUTES,
  P04_MAP_LAYER_IDS,
  P04_SETTING_KEYS,
  createFallbackP04Simulation,
  createFallbackP04Status,
} from './missionBriefing';

describe('P04 mission briefing contracts', () => {
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

  it('defaults to enabled non-secret settings and offline-safe fallback responses', () => {
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

    expect(createFallbackP04Simulation('2026-05-19T08:00:00.000Z', 'ai_dispatch').events).toContain(
      'Prepared operator briefing before AI dispatch',
    );
  });
});
