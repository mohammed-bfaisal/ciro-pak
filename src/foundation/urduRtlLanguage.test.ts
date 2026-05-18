import { describe, expect, it } from 'vitest';
import {
  DEFAULT_P01_SETTINGS,
  P01_API_ROUTES,
  P01_LANGUAGE_PROFILES,
  P01_MAP_LAYER_IDS,
  P01_SETTING_KEYS,
  createFallbackP01Simulation,
  createFallbackP01Status,
  getP01CityLabel,
  resolveP01Runtime,
} from './urduRtlLanguage';

describe('P01 Urdu RTL language contracts', () => {
  it('exports the exact public setting keys from the HTML implementation plan', () => {
    expect(P01_SETTING_KEYS).toEqual({
      enabled: 'ciro.settings.urdu_rtl_language_foundation.enabled',
      mobileParity: 'ciro.settings.urdu_rtl_language_foundation.mobileParity',
      lastReviewedAt: 'ciro.settings.urdu_rtl_language_foundation.lastReviewedAt',
    });
  });

  it('exports the exact backend routes and stable map layer ids', () => {
    expect(P01_API_ROUTES.status).toBe('/api/urdu-rtl-language-foundation/status');
    expect(P01_API_ROUTES.simulate).toBe('/api/urdu-rtl-language-foundation/simulate');
    expect(P01_MAP_LAYER_IDS.primary).toBe('ciro-urdu-rtl-language-foundation-primary');
    expect(P01_MAP_LAYER_IDS.labels).toBe('ciro-urdu-rtl-language-foundation-labels');
  });

  it('defines English, Roman Urdu, and Urdu profiles with the correct text direction', () => {
    expect(P01_LANGUAGE_PROFILES.english.dir).toBe('ltr');
    expect(P01_LANGUAGE_PROFILES.romanUrdu.dir).toBe('ltr');
    expect(P01_LANGUAGE_PROFILES.urdu.dir).toBe('rtl');
    expect(P01_LANGUAGE_PROFILES.urdu.lang).toBe('ur-PK');
  });

  it('defaults to disabled non-secret settings and preserves English LTR runtime attributes', () => {
    expect(DEFAULT_P01_SETTINGS).toEqual({
      enabled: false,
      mobileParity: true,
      lastReviewedAt: null,
    });

    expect(resolveP01Runtime(DEFAULT_P01_SETTINGS)).toEqual({
      mode: 'english',
      dir: 'ltr',
      lang: 'en',
      label: 'English',
    });

    expect(resolveP01Runtime({ ...DEFAULT_P01_SETTINGS, enabled: true })).toEqual({
      mode: 'urdu',
      dir: 'rtl',
      lang: 'ur-PK',
      label: 'Urdu',
    });
  });

  it('provides bundled fallback responses without provider credentials', () => {
    expect(createFallbackP01Status('2026-05-18T08:00:00.000Z')).toEqual({
      status: 'fallback',
      checkedAt: '2026-05-18T08:00:00.000Z',
      backendReachable: false,
      mobileParity: true,
      activeMode: 'urdu',
      direction: 'rtl',
      message: 'Using bundled P01 Urdu and RTL language contracts because no hosted backend is configured.',
    });

    expect(createFallbackP01Simulation('2026-05-18T08:00:00.000Z').events).toEqual([
      'Loaded English operator labels',
      'Loaded Roman Urdu operator labels',
      'Applied Urdu right-to-left runtime attributes',
      'Skipped hosted backend because no safe API base is configured',
    ]);
  });

  it('localizes city labels for Urdu map and chrome surfaces', () => {
    expect(getP01CityLabel('karachi', 'english')).toBe('Karachi');
    expect(getP01CityLabel('karachi', 'romanUrdu')).toBe('Karachi');
    expect(getP01CityLabel('karachi', 'urdu')).toBe('کراچی');
    expect(getP01CityLabel('islamabad', 'urdu')).toBe('اسلام آباد');
  });
});
