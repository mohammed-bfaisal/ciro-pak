import { create } from 'zustand';
import {
  DEFAULT_P00_SETTINGS,
  FOUNDATION_SETTING_KEYS,
  type P00Settings,
} from '../foundation/contracts';
import {
  DEFAULT_P02_SETTINGS,
  DISPLAY_ACCESSIBILITY_SETTING_KEYS,
  type P02Settings,
} from '../displayAccessibility/contracts';

interface SettingsState {
  p00: P00Settings;
  p02: P02Settings;
  loadP00Settings: () => void;
  loadP02Settings: () => void;
  setP00Enabled: (enabled: boolean) => void;
  setP00MobileParity: (mobileParity: boolean) => void;
  markP00Reviewed: (lastReviewedAt: string) => void;
  resetP00Settings: () => void;
  setP02Enabled: (enabled: boolean) => void;
  setP02MobileParity: (mobileParity: boolean) => void;
  markP02Reviewed: (lastReviewedAt: string) => void;
  resetP02Settings: () => void;
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

function readP02Settings(): P02Settings {
  return {
    enabled: readBooleanSetting(DISPLAY_ACCESSIBILITY_SETTING_KEYS.enabled, DEFAULT_P02_SETTINGS.enabled),
    mobileParity: readBooleanSetting(
      DISPLAY_ACCESSIBILITY_SETTING_KEYS.mobileParity,
      DEFAULT_P02_SETTINGS.mobileParity,
    ),
    lastReviewedAt: readIsoSetting(DISPLAY_ACCESSIBILITY_SETTING_KEYS.lastReviewedAt),
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

function persistP02Settings(settings: P02Settings): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.enabled, String(settings.enabled));
  storage.setItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.mobileParity, String(settings.mobileParity));
  if (settings.lastReviewedAt) {
    storage.setItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.lastReviewedAt, settings.lastReviewedAt);
  } else {
    storage.removeItem(DISPLAY_ACCESSIBILITY_SETTING_KEYS.lastReviewedAt);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  p00: { ...DEFAULT_P00_SETTINGS },
  p02: { ...DEFAULT_P02_SETTINGS },

  loadP00Settings: () => set({ p00: readP00Settings() }),
  loadP02Settings: () => set({ p02: readP02Settings() }),

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

  setP02Enabled: (enabled) => {
    const next = { ...get().p02, enabled };
    persistP02Settings(next);
    set({ p02: next });
  },

  setP02MobileParity: (mobileParity) => {
    const next = { ...get().p02, mobileParity };
    persistP02Settings(next);
    set({ p02: next });
  },

  markP02Reviewed: (lastReviewedAt) => {
    const next = { ...get().p02, lastReviewedAt };
    persistP02Settings(next);
    set({ p02: next });
  },

  resetP02Settings: () => set({ p02: { ...DEFAULT_P02_SETTINGS } }),
}));
