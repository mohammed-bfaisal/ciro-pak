import { create } from 'zustand';

export interface AppSettings {
  showTrafficLayer: boolean;
  showSignalHeatmap: boolean;
  showCrisisRadius: boolean;
  showResourceCoverage: boolean;
  enableWeatherUpdates: boolean;
  enableTrafficUpdates: boolean;
  preferBackendData: boolean;
}

export type SettingKey = keyof AppSettings;

interface SettingsState extends AppSettings {
  setSetting: <K extends SettingKey>(key: K, value: AppSettings[K]) => void;
  toggleSetting: (key: SettingKey) => void;
  resetSettings: () => void;
}

export const SETTINGS_STORAGE_KEY = 'ciro.settings.v1';

export const DEFAULT_SETTINGS: AppSettings = {
  showTrafficLayer: true,
  showSignalHeatmap: true,
  showCrisisRadius: true,
  showResourceCoverage: true,
  enableWeatherUpdates: true,
  enableTrafficUpdates: true,
  preferBackendData: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...readStoredSettings(),

  setSetting: (key, value) => set((state) => {
    const next = {
      ...pickSettings(state),
      [key]: value,
    };
    writeStoredSettings(next);
    return next;
  }),

  toggleSetting: (key) => set((state) => {
    const next = {
      ...pickSettings(state),
      [key]: !state[key],
    };
    writeStoredSettings(next);
    return next;
  }),

  resetSettings: () => {
    writeStoredSettings(DEFAULT_SETTINGS);
    set(DEFAULT_SETTINGS);
  },
}));

export function getApiClientOptionsForSettings(): { baseUrl?: string | null } {
  return useSettingsStore.getState().preferBackendData ? {} : { baseUrl: null };
}

function pickSettings(state: AppSettings): AppSettings {
  return {
    showTrafficLayer: state.showTrafficLayer,
    showSignalHeatmap: state.showSignalHeatmap,
    showCrisisRadius: state.showCrisisRadius,
    showResourceCoverage: state.showResourceCoverage,
    enableWeatherUpdates: state.enableWeatherUpdates,
    enableTrafficUpdates: state.enableTrafficUpdates,
    preferBackendData: state.preferBackendData,
  };
}

function readStoredSettings(): AppSettings {
  const storage = getStorage();
  if (!storage) return DEFAULT_SETTINGS;

  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value === 'boolean'),
      ),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeStoredSettings(settings: AppSettings) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Settings are safe to lose; never block the app because device storage is unavailable.
  }
}

function getStorage(): Storage | null {
  try {
    return typeof globalThis.localStorage === 'undefined'
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
}
