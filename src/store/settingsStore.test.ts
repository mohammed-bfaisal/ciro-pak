import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_P00_SETTINGS, FOUNDATION_SETTING_KEYS } from '../foundation/contracts';
import { DEFAULT_P02_SETTINGS, DISPLAY_ACCESSIBILITY_SETTING_KEYS } from '../displayAccessibility/contracts';
import { useSettingsStore } from './settingsStore';

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

function storageKeys(storage: Storage): string[] {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => key !== null);
}

describe('settings store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
    localStorage.clear();
    useSettingsStore.getState().resetP00Settings();
    useSettingsStore.getState().resetP02Settings();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('loads default P00 settings without storing secrets', () => {
    expect(useSettingsStore.getState().p00).toEqual(DEFAULT_P00_SETTINGS);
    expect(storageKeys(localStorage)).toEqual([]);
  });

  it('loads default P02 settings without changing display behavior', () => {
    expect(useSettingsStore.getState().p02).toEqual(DEFAULT_P02_SETTINGS);
    expect(storageKeys(localStorage)).toEqual([]);
  });

  it('persists only approved P00 setting keys', () => {
    useSettingsStore.getState().setP00Enabled(false);
    useSettingsStore.getState().setP00MobileParity(false);
    useSettingsStore.getState().markP00Reviewed('2026-05-18T08:00:00.000Z');

    expect(localStorage.getItem(FOUNDATION_SETTING_KEYS.enabled)).toBe('false');
    expect(localStorage.getItem(FOUNDATION_SETTING_KEYS.mobileParity)).toBe('false');
    expect(localStorage.getItem(FOUNDATION_SETTING_KEYS.lastReviewedAt)).toBe('2026-05-18T08:00:00.000Z');
    expect(storageKeys(localStorage).sort()).toEqual(Object.values(FOUNDATION_SETTING_KEYS).sort());
  });

  it('persists only approved P02 setting keys', () => {
    useSettingsStore.getState().setP02Enabled(true);
    useSettingsStore.getState().setP02MobileParity(false);
    useSettingsStore.getState().markP02Reviewed('2026-05-19T08:00:00.000Z');

    expect(localStorage.getItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.enabled)).toBe('true');
    expect(localStorage.getItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.mobileParity)).toBe('false');
    expect(localStorage.getItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.lastReviewedAt)).toBe('2026-05-19T08:00:00.000Z');
    expect(storageKeys(localStorage).sort()).toEqual(Object.values(DISPLAY_ACCESSIBILITY_SETTING_KEYS).sort());
  });

  it('recovers from corrupt localStorage values with safe defaults', () => {
    localStorage.setItem(FOUNDATION_SETTING_KEYS.enabled, 'not-a-bool');
    localStorage.setItem(FOUNDATION_SETTING_KEYS.mobileParity, 'not-a-bool');
    localStorage.setItem(FOUNDATION_SETTING_KEYS.lastReviewedAt, '<script>alert(1)</script>');

    useSettingsStore.getState().loadP00Settings();

    expect(useSettingsStore.getState().p00).toEqual(DEFAULT_P00_SETTINGS);
  });

  it('recovers P02 from corrupt localStorage values with safe defaults', () => {
    localStorage.setItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.enabled, 'not-a-bool');
    localStorage.setItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.mobileParity, 'not-a-bool');
    localStorage.setItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.lastReviewedAt, '<script>alert(1)</script>');

    useSettingsStore.getState().loadP02Settings();

    expect(useSettingsStore.getState().p02).toEqual(DEFAULT_P02_SETTINGS);
  });
});
