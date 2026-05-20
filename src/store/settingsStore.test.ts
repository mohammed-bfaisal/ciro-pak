import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, getApiClientOptionsForSettings, useSettingsStore } from './settingsStore';

describe('settings store', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  it('starts with mobile-safe data and map defaults', () => {
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
    expect(useSettingsStore.getState().mapTileMode).toBe('dark');
  });

  it('shows resource coverage ranges by default', () => {
    expect(useSettingsStore.getState().showResourceCoverage).toBe(true);
  });

  it('toggles individual boolean settings atomically', () => {
    useSettingsStore.getState().toggleSetting('enableTrafficUpdates');

    expect(useSettingsStore.getState().enableTrafficUpdates).toBe(false);
    expect(useSettingsStore.getState().enableWeatherUpdates).toBe(true);
  });

  it('can force API adapters into local fallback mode without changing env', () => {
    useSettingsStore.getState().setSetting('preferBackendData', false);

    expect(getApiClientOptionsForSettings()).toEqual({ baseUrl: null });
  });

  it('persists map tile mode separately from boolean toggles', () => {
    useSettingsStore.getState().setSetting('mapTileMode', 'satellite');

    expect(useSettingsStore.getState().mapTileMode).toBe('satellite');
  });
});
