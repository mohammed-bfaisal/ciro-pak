import { describe, expect, it } from 'vitest';
import {
  DEFAULT_P00_SETTINGS,
  FOUNDATION_API_ROUTES,
  FOUNDATION_MAP_LAYER_IDS,
  FOUNDATION_SETTING_KEYS,
  createFallbackP00Status,
} from './contracts';

describe('P00 foundation contracts', () => {
  it('exports the exact public setting keys from the HTML implementation plan', () => {
    expect(FOUNDATION_SETTING_KEYS).toEqual({
      enabled: 'ciro.settings.foundation_settings_backend_contracts.enabled',
      mobileParity: 'ciro.settings.foundation_settings_backend_contracts.mobileParity',
      lastReviewedAt: 'ciro.settings.foundation_settings_backend_contracts.lastReviewedAt',
    });
  });

  it('exports the exact backend routes and stable map layer ids', () => {
    expect(FOUNDATION_API_ROUTES.status).toBe('/api/foundation-settings-backend-contracts/status');
    expect(FOUNDATION_API_ROUTES.simulate).toBe('/api/foundation-settings-backend-contracts/simulate');
    expect(FOUNDATION_MAP_LAYER_IDS.primary).toBe('ciro-foundation-settings-backend-contracts-primary');
    expect(FOUNDATION_MAP_LAYER_IDS.labels).toBe('ciro-foundation-settings-backend-contracts-labels');
  });

  it('defaults to enabled non-secret settings and an offline-safe fallback status', () => {
    expect(DEFAULT_P00_SETTINGS).toEqual({
      enabled: true,
      mobileParity: true,
      lastReviewedAt: null,
    });

    expect(createFallbackP00Status('2026-05-18T08:00:00.000Z')).toEqual({
      status: 'fallback',
      checkedAt: '2026-05-18T08:00:00.000Z',
      backendReachable: false,
      mobileParity: true,
      message: 'Using bundled P00 foundation contracts because no hosted backend is configured.',
    });
  });
});
