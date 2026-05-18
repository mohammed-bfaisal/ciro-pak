import { create } from 'zustand';
import {
  DEFAULT_P00_SETTINGS,
  FOUNDATION_SETTING_KEYS,
  type P00Settings,
} from '../foundation/contracts';

interface SettingsState {
  p00: P00Settings;
  loadP00Settings: () => void;
  setP00Enabled: (enabled: boolean) => void;
  setP00MobileParity: (mobileParity: boolean) => void;
  markP00Reviewed: (lastReviewedAt: string) => void;
  resetP00Settings: () => void;
}

function getStorage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

function readBooleanSetting(key: string, fallback: boolean): boolean {
  const storage = getStorage();
  if (!storage) return fallback;
  const value = storage.getItem(key);
  if (value === null) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function readIsoSetting(key: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  const value = storage.getItem(key);
  if (!value) return null;
  return Number.isNaN(Date.parse(value)) ? null : value;
}

function readP00Settings(): P00Settings {
  return {
    enabled: readBooleanSetting(FOUNDATION_SETTING_KEYS.enabled, DEFAULT_P00_SETTINGS.enabled),
    mobileParity: readBooleanSetting(FOUNDATION_SETTING_KEYS.mobileParity, DEFAULT_P00_SETTINGS.mobileParity),
    lastReviewedAt: readIsoSetting(FOUNDATION_SETTING_KEYS.lastReviewedAt),
  };
}

function persistP00Settings(settings: P00Settings): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(FOUNDATION_SETTING_KEYS.enabled, String(settings.enabled));
  storage.setItem(FOUNDATION_SETTING_KEYS.mobileParity, String(settings.mobileParity));
  if (settings.lastReviewedAt) {
    storage.setItem(FOUNDATION_SETTING_KEYS.lastReviewedAt, settings.lastReviewedAt);
  } else {
    storage.removeItem(FOUNDATION_SETTING_KEYS.lastReviewedAt);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  p00: { ...DEFAULT_P00_SETTINGS },

  loadP00Settings: () => set({ p00: readP00Settings() }),

  setP00Enabled: (enabled) => {
    const next = { ...get().p00, enabled };
    persistP00Settings(next);
    set({ p00: next });
  },

  setP00MobileParity: (mobileParity) => {
    const next = { ...get().p00, mobileParity };
    persistP00Settings(next);
    set({ p00: next });
  },

  markP00Reviewed: (lastReviewedAt) => {
    const next = { ...get().p00, lastReviewedAt };
    persistP00Settings(next);
    set({ p00: next });
  },

  resetP00Settings: () => set({ p00: { ...DEFAULT_P00_SETTINGS } }),
}));
