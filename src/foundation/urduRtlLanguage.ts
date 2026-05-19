import type { City } from '../types';

export const P01_SETTING_KEYS = {
  enabled: 'ciro.settings.urdu_rtl_language_foundation.enabled',
  mobileParity: 'ciro.settings.urdu_rtl_language_foundation.mobileParity',
  lastReviewedAt: 'ciro.settings.urdu_rtl_language_foundation.lastReviewedAt',
} as const;

export const P01_API_ROUTES = {
  status: '/api/urdu-rtl-language-foundation/status',
  simulate: '/api/urdu-rtl-language-foundation/simulate',
} as const;

export const P01_MAP_LAYER_IDS = {
  source: 'ciro-urdu-rtl-language-foundation-source',
  primary: 'ciro-urdu-rtl-language-foundation-primary',
  labels: 'ciro-urdu-rtl-language-foundation-labels',
} as const;

export type P01Status = 'idle' | 'checking' | 'ready' | 'fallback' | 'error';
export type P01LanguageMode = 'english' | 'romanUrdu' | 'urdu';
export type P01Direction = 'ltr' | 'rtl';

export interface P01Settings {
  enabled: boolean;
  mobileParity: boolean;
  lastReviewedAt: string | null;
}

export interface P01LanguageProfile {
  mode: P01LanguageMode;
  label: string;
  nativeLabel: string;
  lang: string;
  dir: P01Direction;
  sample: string;
}

export interface P01Runtime {
  mode: P01LanguageMode;
  dir: P01Direction;
  lang: string;
  label: string;
}

export interface P01BackendStatus {
  status: Exclude<P01Status, 'idle' | 'checking'>;
  checkedAt: string;
  backendReachable: boolean;
  mobileParity: boolean;
  activeMode: P01LanguageMode;
  direction: P01Direction;
  message: string;
}

export interface P01SimulationRequest {
  city: City;
  requestedAt: string;
  source: 'settings' | 'startup' | 'operator';
  mode: P01LanguageMode;
}

export interface P01SimulationResponse {
  status: Exclude<P01Status, 'idle' | 'checking'>;
  simulatedAt: string;
  backendReachable: boolean;
  activeMode: P01LanguageMode;
  direction: P01Direction;
  events: string[];
  message: string;
}

export const DEFAULT_P01_SETTINGS: P01Settings = {
  enabled: false,
  mobileParity: true,
  lastReviewedAt: null,
};

export const P01_LANGUAGE_PROFILES: Record<P01LanguageMode, P01LanguageProfile> = {
  english: {
    mode: 'english',
    label: 'English',
    nativeLabel: 'English',
    lang: 'en',
    dir: 'ltr',
    sample: 'Incident ready for operator review.',
  },
  romanUrdu: {
    mode: 'romanUrdu',
    label: 'Roman Urdu',
    nativeLabel: 'Roman Urdu',
    lang: 'ur-Latn-PK',
    dir: 'ltr',
    sample: 'Incident operator ke jaizay ke liye tayyar hai.',
  },
  urdu: {
    mode: 'urdu',
    label: 'Urdu',
    nativeLabel: 'اردو',
    lang: 'ur-PK',
    dir: 'rtl',
    sample: 'واقعہ آپریٹر کے جائزے کے لیے تیار ہے۔',
  },
};

const P01_CITY_LABELS: Record<City, Record<P01LanguageMode, string>> = {
  karachi: { english: 'Karachi', romanUrdu: 'Karachi', urdu: 'کراچی' },
  islamabad: { english: 'Islamabad', romanUrdu: 'Islamabad', urdu: 'اسلام آباد' },
  lahore: { english: 'Lahore', romanUrdu: 'Lahore', urdu: 'لاہور' },
  rawalpindi: { english: 'Rawalpindi', romanUrdu: 'Rawalpindi', urdu: 'راولپنڈی' },
  faisalabad: { english: 'Faisalabad', romanUrdu: 'Faisalabad', urdu: 'فیصل آباد' },
  multan: { english: 'Multan', romanUrdu: 'Multan', urdu: 'ملتان' },
  gujranwala: { english: 'Gujranwala', romanUrdu: 'Gujranwala', urdu: 'گوجرانوالہ' },
  sialkot: { english: 'Sialkot', romanUrdu: 'Sialkot', urdu: 'سیالکوٹ' },
  bahawalpur: { english: 'Bahawalpur', romanUrdu: 'Bahawalpur', urdu: 'بہاولپور' },
  sargodha: { english: 'Sargodha', romanUrdu: 'Sargodha', urdu: 'سرگودھا' },
  peshawar: { english: 'Peshawar', romanUrdu: 'Peshawar', urdu: 'پشاور' },
  abbottabad: { english: 'Abbottabad', romanUrdu: 'Abbottabad', urdu: 'ایبٹ آباد' },
  quetta: { english: 'Quetta', romanUrdu: 'Quetta', urdu: 'کوئٹہ' },
  gwadar: { english: 'Gwadar', romanUrdu: 'Gwadar', urdu: 'گوادر' },
  hyderabad: { english: 'Hyderabad', romanUrdu: 'Hyderabad', urdu: 'حیدرآباد' },
  sukkur: { english: 'Sukkur', romanUrdu: 'Sukkur', urdu: 'سکھر' },
};

export function resolveP01Runtime(settings: P01Settings): P01Runtime {
  const profile = settings.enabled ? P01_LANGUAGE_PROFILES.urdu : P01_LANGUAGE_PROFILES.english;
  return {
    mode: profile.mode,
    dir: profile.dir,
    lang: profile.lang,
    label: profile.label,
  };
}

export function getP01CityLabel(city: City, mode: P01LanguageMode): string {
  return P01_CITY_LABELS[city][mode];
}

export function createFallbackP01Status(nowIso: string): P01BackendStatus {
  return {
    status: 'fallback',
    checkedAt: nowIso,
    backendReachable: false,
    mobileParity: true,
    activeMode: 'urdu',
    direction: 'rtl',
    message: 'Using bundled P01 Urdu and RTL language contracts because no hosted backend is configured.',
  };
}

export function createFallbackP01Simulation(
  nowIso: string,
  mode: P01LanguageMode = 'urdu',
): P01SimulationResponse {
  const profile = P01_LANGUAGE_PROFILES[mode];
  return {
    status: 'fallback',
    simulatedAt: nowIso,
    backendReachable: false,
    activeMode: profile.mode,
    direction: profile.dir,
    events: [
      'Loaded English operator labels',
      'Loaded Roman Urdu operator labels',
      'Applied Urdu right-to-left runtime attributes',
      'Skipped hosted backend because no safe API base is configured',
    ],
    message: 'P01 simulation used bundled Urdu and RTL language contracts.',
  };
}
