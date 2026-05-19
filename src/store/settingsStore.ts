import { create } from 'zustand';
import {
  DEFAULT_P00_SETTINGS,
  FOUNDATION_SETTING_KEYS,
  type P00Settings,
} from '../foundation/contracts';
import {
  DEFAULT_P01_SETTINGS,
  P01_SETTING_KEYS,
  type P01Settings,
} from '../foundation/urduRtlLanguage';

interface SettingsState {
  p00: P00Settings;
  p01: P01Settings;
  loadP00Settings: () => void;
  loadP01Settings: () => void;
  setP00Enabled: (enabled: boolean) => void;
  setP00MobileParity: (mobileParity: boolean) => void;
  markP00Reviewed: (lastReviewedAt: string) => void;
  resetP00Settings: () => void;
  setP01Enabled: (enabled: boolean) => void;
  setP01MobileParity: (mobileParity: boolean) => void;
  markP01Reviewed: (lastReviewedAt: string) => void;
  resetP01Settings: () => void;
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

function readP01Settings(): P01Settings {
  return {
    enabled: readBooleanSetting(P01_SETTING_KEYS.enabled, DEFAULT_P01_SETTINGS.enabled),
    mobileParity: readBooleanSetting(P01_SETTING_KEYS.mobileParity, DEFAULT_P01_SETTINGS.mobileParity),
    lastReviewedAt: readIsoSetting(P01_SETTING_KEYS.lastReviewedAt),
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

function persistP01Settings(settings: P01Settings): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(P01_SETTING_KEYS.enabled, String(settings.enabled));
  storage.setItem(P01_SETTING_KEYS.mobileParity, String(settings.mobileParity));
  if (settings.lastReviewedAt) {
    storage.setItem(P01_SETTING_KEYS.lastReviewedAt, settings.lastReviewedAt);
  } else {
    storage.removeItem(P01_SETTING_KEYS.lastReviewedAt);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  p00: { ...DEFAULT_P00_SETTINGS },
  p01: { ...DEFAULT_P01_SETTINGS },

  loadP00Settings: () => set({ p00: readP00Settings() }),
  loadP01Settings: () => set({ p01: readP01Settings() }),

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

  setP01Enabled: (enabled) => {
    const next = { ...get().p01, enabled };
    persistP01Settings(next);
    set({ p01: next });
  },

  setP01MobileParity: (mobileParity) => {
    const next = { ...get().p01, mobileParity };
    persistP01Settings(next);
    set({ p01: next });
  },

  markP01Reviewed: (lastReviewedAt) => {
    const next = { ...get().p01, lastReviewedAt };
    persistP01Settings(next);
    set({ p01: next });
  },

  resetP01Settings: () => set({ p01: { ...DEFAULT_P01_SETTINGS } }),
}));
