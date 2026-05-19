import { describe, expect, it } from 'vitest';
import {
  DEFAULT_P02_SETTINGS,
  DISPLAY_ACCESSIBILITY_API_ROUTES,
  DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS,
  DISPLAY_ACCESSIBILITY_SETTING_KEYS,
  createFallbackP02Simulation,
  createFallbackP02Status,
  resolveP02DisplayPreferences,
} from './contracts';

describe('P02 display accessibility contracts', () => {
  it('uses the public P02 settings, API routes, and map layer identifiers', () => {
    expect(DISPLAY_ACCESSIBILITY_SETTING_KEYS).toEqual({
      enabled: 'ciro.settings.display_accessibility_settings.enabled',
      mobileParity: 'ciro.settings.display_accessibility_settings.mobileParity',
      lastReviewedAt: 'ciro.settings.display_accessibility_settings.lastReviewedAt',
    });
    expect(DISPLAY_ACCESSIBILITY_API_ROUTES.status).toBe('/api/display-accessibility-settings/status');
    expect(DISPLAY_ACCESSIBILITY_API_ROUTES.simulate).toBe('/api/display-accessibility-settings/simulate');
    expect(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.primary).toBe('ciro-display-accessibility-settings-primary');
    expect(DISPLAY_ACCESSIBILITY_MAP_LAYER_IDS.labels).toBe('ciro-display-accessibility-settings-labels');
  });

  it('defaults to unchanged display behavior until the P02 preset is enabled', () => {
    expect(DEFAULT_P02_SETTINGS).toEqual({
      enabled: false,
      mobileParity: true,
      lastReviewedAt: null,
    });

    expect(resolveP02DisplayPreferences(DEFAULT_P02_SETTINGS)).toEqual({
      textDensity: 'standard',
      largeText: false,
      colorblindSafe: false,
    });
    expect(resolveP02DisplayPreferences({ ...DEFAULT_P02_SETTINGS, enabled: true })).toEqual({
      textDensity: 'comfortable',
      largeText: true,
      colorblindSafe: true,
    });
  });

  it('creates offline-safe fallback responses for APK use', () => {
    const status = createFallbackP02Status('2026-05-19T08:00:00.000Z');
    const simulation = createFallbackP02Simulation('2026-05-19T08:00:00.000Z');

    expect(status).toEqual({
      status: 'fallback',
      checkedAt: '2026-05-19T08:00:00.000Z',
      backendReachable: false,
      mobileParity: true,
      message: 'Using bundled P02 display accessibility preferences because no hosted backend is configured.',
    });
    expect(simulation.events).toContain('Applied larger text display preset');
    expect(simulation.events).toContain('Applied colorblind-safe map layer identifiers');
  });
});
