# P00 Foundation Settings And Backend Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the P00 foundation settings, non-secret persistence, backend contract adapter, runtime status state, and stable map layer IDs required by the HTML implementation plan.

**Architecture:** Keep the existing React/Vite/Zustand/MapLibre/Capacitor app intact. Add a small foundation contracts module, a non-secret settings store, typed P00 state in `sessionStore`, a backend-base adapter with bundled fallback behavior, a narrow `/settings` surface, and a MapLibre helper that owns the two stable P00 layer IDs.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Zustand 5, MapLibre GL 5, Vitest 4, Capacitor 8

---

## Source Of Truth Read Before This Plan

- `C:\Users\DELL\.config\superpowers\worktrees\ciro-pak\codex-html-implementation-plans\docs\implementation-plans\index.html`
- `C:\Users\DELL\.config\superpowers\worktrees\ciro-pak\codex-html-implementation-plans\docs\implementation-plans\shared-context.html`
- `C:\Users\DELL\.config\superpowers\worktrees\ciro-pak\codex-html-implementation-plans\docs\implementation-plans\p00-foundation-settings-backend-contracts.html`

The HTML plan requires these public contracts:

| Kind | Contract |
|---|---|
| Setting | `ciro.settings.foundation_settings_backend_contracts.enabled` |
| Setting | `ciro.settings.foundation_settings_backend_contracts.mobileParity` |
| Setting | `ciro.settings.foundation_settings_backend_contracts.lastReviewedAt` |
| Store field | `p00Status` |
| Store field | `p00LastUpdatedAt` |
| Store field | `p00ErrorState` |
| API route | `GET /api/foundation-settings-backend-contracts/status` |
| API route | `POST /api/foundation-settings-backend-contracts/simulate` |
| Map layer | `ciro-foundation-settings-backend-contracts-primary` |
| Map layer | `ciro-foundation-settings-backend-contracts-labels` |

## Current Repo Facts To Preserve

- `src/App.tsx` owns routes inside `Shell`.
- `src/components/layout/TopBar.tsx` currently has the city selector and an unused right column.
- `src/components/layout/Sidebar.tsx` owns desktop navigation.
- `src/components/layout/BottomNav.tsx` owns mobile bottom navigation.
- `src/pages/Dashboard.tsx` mounts `CiroMap`, overlays, and `MobileOperationsDock`.
- `src/components/map/CiroMap.tsx` owns MapLibre setup, signals, crises, vehicle markers, and route layers.
- `src/store/sessionStore.ts`, `src/store/resourceStore.ts`, and `src/store/traceStore.ts` are plain Zustand stores without persist middleware.
- `src/api/routing.ts` and `src/api/weather.ts` currently read provider API key env vars in frontend code. P00 must not add more frontend secret paths. Treat removal or migration of those legacy direct-provider paths as a separate atomic follow-up unless the user explicitly folds it into P00 implementation.

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/foundation/contracts.ts` | Create | Shared P00 setting keys, API paths, map IDs, default settings, fallback status data, typed request/response contracts |
| `src/foundation/contracts.test.ts` | Create | Unit tests for exact public contract strings and fallback shape |
| `src/store/settingsStore.ts` | Create | Non-secret localStorage-backed P00 settings store |
| `src/store/settingsStore.test.ts` | Create | Store persistence and corrupt localStorage recovery tests |
| `src/store/sessionStore.ts` | Modify | Add typed P00 runtime state fields and setters without changing current demo flow |
| `src/store/sessionStore.test.ts` | Modify | Assert P00 default/reset/update behavior alongside existing session integration |
| `src/api/backendConfig.ts` | Create | API base URL resolver that rejects localhost for native APK runtime and never accepts secret values |
| `src/api/backendConfig.test.ts` | Create | Tests for browser/native backend base behavior |
| `src/api/foundation.ts` | Create | `GET status` and `POST simulate` client with bundled fallback |
| `src/api/foundation.test.ts` | Create | Tests for success, no-backend fallback, and failed backend fallback |
| `src/pages/SettingsPage.tsx` | Create | Dark command-center settings surface for P00 status and non-secret toggles |
| `src/pages/SettingsPage.test.tsx` | Create | Static rendering test for settings text and no secret fields |
| `src/App.tsx` | Modify | Add `/settings` route |
| `src/components/layout/Sidebar.tsx` | Modify | Add desktop Settings nav item |
| `src/components/layout/TopBar.tsx` | Modify | Add touch-accessible Settings icon in the existing right slot |
| `src/components/map/foundationLayers.ts` | Create | MapLibre source/layer helper with stable P00 layer IDs |
| `src/components/map/foundationLayers.test.ts` | Create | Pure GeoJSON and layer ID tests |
| `src/components/map/CiroMap.tsx` | Modify | Wire P00 layer helper to map load, city changes, and settings toggle |

---

## Task 1: Foundation Contract Constants

**Files:**
- Create: `src/foundation/contracts.ts`
- Create: `src/foundation/contracts.test.ts`

- [ ] **Step 1: Write the failing contract tests**

Create `src/foundation/contracts.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
npm test -- src/foundation/contracts.test.ts
```

Expected: fail with a module resolution error for `./contracts`.

- [ ] **Step 3: Add the minimal contracts module**

Create `src/foundation/contracts.ts`:

```ts
export const FOUNDATION_SETTING_KEYS = {
  enabled: 'ciro.settings.foundation_settings_backend_contracts.enabled',
  mobileParity: 'ciro.settings.foundation_settings_backend_contracts.mobileParity',
  lastReviewedAt: 'ciro.settings.foundation_settings_backend_contracts.lastReviewedAt',
} as const;

export const FOUNDATION_API_ROUTES = {
  status: '/api/foundation-settings-backend-contracts/status',
  simulate: '/api/foundation-settings-backend-contracts/simulate',
} as const;

export const FOUNDATION_MAP_LAYER_IDS = {
  source: 'ciro-foundation-settings-backend-contracts-source',
  primary: 'ciro-foundation-settings-backend-contracts-primary',
  labels: 'ciro-foundation-settings-backend-contracts-labels',
} as const;

export type P00Status = 'idle' | 'checking' | 'ready' | 'fallback' | 'error';

export interface P00Settings {
  enabled: boolean;
  mobileParity: boolean;
  lastReviewedAt: string | null;
}

export interface P00BackendStatus {
  status: Exclude<P00Status, 'idle' | 'checking'>;
  checkedAt: string;
  backendReachable: boolean;
  mobileParity: boolean;
  message: string;
}

export interface P00SimulationRequest {
  city: string;
  requestedAt: string;
  source: 'settings' | 'startup' | 'operator';
}

export interface P00SimulationResponse {
  status: Exclude<P00Status, 'idle' | 'checking'>;
  simulatedAt: string;
  backendReachable: boolean;
  events: string[];
  message: string;
}

export const DEFAULT_P00_SETTINGS: P00Settings = {
  enabled: true,
  mobileParity: true,
  lastReviewedAt: null,
};

export function createFallbackP00Status(nowIso: string): P00BackendStatus {
  return {
    status: 'fallback',
    checkedAt: nowIso,
    backendReachable: false,
    mobileParity: true,
    message: 'Using bundled P00 foundation contracts because no hosted backend is configured.',
  };
}

export function createFallbackP00Simulation(nowIso: string): P00SimulationResponse {
  return {
    status: 'fallback',
    simulatedAt: nowIso,
    backendReachable: false,
    events: [
      'Loaded non-secret settings contract',
      'Confirmed bundled fallback path',
      'Skipped hosted backend because no safe API base is configured',
    ],
    message: 'P00 simulation used bundled fallback contracts.',
  };
}
```

- [ ] **Step 4: Run the contract test again**

Run:

```powershell
npm test -- src/foundation/contracts.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```powershell
git add src/foundation/contracts.ts src/foundation/contracts.test.ts
git commit -m "feat: add p00 foundation contracts"
```

---

## Task 2: Non-Secret Settings Store

**Files:**
- Create: `src/store/settingsStore.ts`
- Create: `src/store/settingsStore.test.ts`

- [ ] **Step 1: Write the failing settings store tests**

Create `src/store/settingsStore.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_P00_SETTINGS, FOUNDATION_SETTING_KEYS } from '../foundation/contracts';
import { useSettingsStore } from './settingsStore';

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.getState().resetP00Settings();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('loads default P00 settings without storing secrets', () => {
    expect(useSettingsStore.getState().p00).toEqual(DEFAULT_P00_SETTINGS);
    expect(Object.keys(localStorage)).toEqual([]);
  });

  it('persists only approved P00 setting keys', () => {
    useSettingsStore.getState().setP00Enabled(false);
    useSettingsStore.getState().setP00MobileParity(false);
    useSettingsStore.getState().markP00Reviewed('2026-05-18T08:00:00.000Z');

    expect(localStorage.getItem(FOUNDATION_SETTING_KEYS.enabled)).toBe('false');
    expect(localStorage.getItem(FOUNDATION_SETTING_KEYS.mobileParity)).toBe('false');
    expect(localStorage.getItem(FOUNDATION_SETTING_KEYS.lastReviewedAt)).toBe('2026-05-18T08:00:00.000Z');
    expect(Object.keys(localStorage).sort()).toEqual(Object.values(FOUNDATION_SETTING_KEYS).sort());
  });

  it('recovers from corrupt localStorage values with safe defaults', () => {
    localStorage.setItem(FOUNDATION_SETTING_KEYS.enabled, 'not-a-bool');
    localStorage.setItem(FOUNDATION_SETTING_KEYS.mobileParity, 'not-a-bool');
    localStorage.setItem(FOUNDATION_SETTING_KEYS.lastReviewedAt, '<script>alert(1)</script>');

    useSettingsStore.getState().loadP00Settings();

    expect(useSettingsStore.getState().p00).toEqual(DEFAULT_P00_SETTINGS);
  });
});
```

- [ ] **Step 2: Run the failing settings test**

Run:

```powershell
npm test -- src/store/settingsStore.test.ts
```

Expected: fail with a module resolution error for `./settingsStore`.

- [ ] **Step 3: Add the settings store**

Create `src/store/settingsStore.ts`:

```ts
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

function readBooleanSetting(key: string, fallback: boolean): boolean {
  if (typeof localStorage === 'undefined') return fallback;
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function readIsoSetting(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  const value = localStorage.getItem(key);
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
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FOUNDATION_SETTING_KEYS.enabled, String(settings.enabled));
  localStorage.setItem(FOUNDATION_SETTING_KEYS.mobileParity, String(settings.mobileParity));
  if (settings.lastReviewedAt) {
    localStorage.setItem(FOUNDATION_SETTING_KEYS.lastReviewedAt, settings.lastReviewedAt);
  } else {
    localStorage.removeItem(FOUNDATION_SETTING_KEYS.lastReviewedAt);
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
```

- [ ] **Step 4: Run the settings test again**

Run:

```powershell
npm test -- src/store/settingsStore.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```powershell
git add src/store/settingsStore.ts src/store/settingsStore.test.ts
git commit -m "feat: add non-secret p00 settings store"
```

---

## Task 3: Session Store P00 Runtime State

**Files:**
- Modify: `src/store/sessionStore.ts`
- Modify: `src/store/sessionStore.test.ts`

- [ ] **Step 1: Add failing assertions to the existing session store test**

Append this test to `src/store/sessionStore.test.ts` inside the `describe` block:

```ts
  it('tracks P00 runtime status without changing the live dispatch defaults', () => {
    const session = useSessionStore.getState();

    expect(session.p00Status).toBe('idle');
    expect(session.p00LastUpdatedAt).toBeNull();
    expect(session.p00ErrorState).toBeNull();

    session.setP00Status('ready', '2026-05-18T08:00:00.000Z');
    expect(useSessionStore.getState().p00Status).toBe('ready');
    expect(useSessionStore.getState().p00LastUpdatedAt).toBe('2026-05-18T08:00:00.000Z');

    session.setP00ErrorState('backend unavailable');
    expect(useSessionStore.getState().p00Status).toBe('error');
    expect(useSessionStore.getState().p00ErrorState).toBe('backend unavailable');

    useSessionStore.getState().reset();
    expect(useSessionStore.getState().p00Status).toBe('idle');
    expect(useSessionStore.getState().p00ErrorState).toBeNull();
  });
```

- [ ] **Step 2: Run the failing session test**

Run:

```powershell
npm test -- src/store/sessionStore.test.ts
```

Expected: fail because `p00Status`, `p00LastUpdatedAt`, `p00ErrorState`, `setP00Status`, and `setP00ErrorState` do not exist.

- [ ] **Step 3: Extend `sessionStore` minimally**

Modify imports in `src/store/sessionStore.ts`:

```ts
import type { AgentTraceEvent, City, ImpactSnapshot } from '../types';
import type { P00Status } from '../foundation/contracts';
```

Extend the `SessionState` interface:

```ts
  p00Status: P00Status;
  p00LastUpdatedAt: string | null;
  p00ErrorState: string | null;
  setP00Status: (status: P00Status, updatedAt: string) => void;
  setP00ErrorState: (message: string | null) => void;
```

Add defaults inside the store object:

```ts
  p00Status: 'idle',
  p00LastUpdatedAt: null,
  p00ErrorState: null,
```

Add methods before `reset`:

```ts
  setP00Status: (p00Status, p00LastUpdatedAt) => set({
    p00Status,
    p00LastUpdatedAt,
    p00ErrorState: p00Status === 'error' ? get().p00ErrorState : null,
  }),

  setP00ErrorState: (message) => set({
    p00Status: message ? 'error' : 'idle',
    p00ErrorState: message,
    p00LastUpdatedAt: new Date().toISOString(),
  }),
```

Update `reset` to preserve existing behavior and reset only P00 runtime fields:

```ts
  reset: () => set({
    live: null,
    traceEvents: [],
    impactSnapshots: [],
    p00Status: 'idle',
    p00LastUpdatedAt: null,
    p00ErrorState: null,
  }),
```

- [ ] **Step 4: Run the session test again**

Run:

```powershell
npm test -- src/store/sessionStore.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```powershell
git add src/store/sessionStore.ts src/store/sessionStore.test.ts
git commit -m "feat: add p00 runtime status to session store"
```

---

## Task 4: Backend Base URL And P00 API Client

**Files:**
- Create: `src/api/backendConfig.ts`
- Create: `src/api/backendConfig.test.ts`
- Create: `src/api/foundation.ts`
- Create: `src/api/foundation.test.ts`

- [ ] **Step 1: Write failing backend config tests**

Create `src/api/backendConfig.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getBackendBaseUrl } from './backendConfig';

describe('backend config', () => {
  it('normalizes a hosted backend base URL and removes trailing slashes', () => {
    expect(getBackendBaseUrl({
      rawBaseUrl: 'https://ciro-api.example.com/',
      isNativePlatform: false,
    })).toBe('https://ciro-api.example.com');
  });

  it('returns null for an empty backend base URL', () => {
    expect(getBackendBaseUrl({ rawBaseUrl: '', isNativePlatform: false })).toBeNull();
  });

  it('rejects localhost and insecure origins for native APK runtime', () => {
    expect(getBackendBaseUrl({
      rawBaseUrl: 'http://localhost:8787',
      isNativePlatform: true,
    })).toBeNull();
    expect(getBackendBaseUrl({
      rawBaseUrl: 'http://api.example.com',
      isNativePlatform: true,
    })).toBeNull();
  });
});
```

- [ ] **Step 2: Write failing P00 API tests**

Create `src/api/foundation.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { checkFoundationStatus, simulateFoundationContracts } from './foundation';

describe('foundation API client', () => {
  it('uses the hosted backend status route when a safe base URL is configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        status: 'ready',
        checkedAt: '2026-05-18T08:00:00.000Z',
        backendReachable: true,
        mobileParity: true,
        message: 'Backend ready',
      }),
    })) as unknown as typeof fetch;

    const result = await checkFoundationStatus({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/foundation-settings-backend-contracts/status',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.status).toBe('ready');
    expect(result.backendReachable).toBe(true);
  });

  it('falls back when no backend base URL is configured', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;

    const result = await checkFoundationStatus({
      baseUrl: null,
      fetcher,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.status).toBe('fallback');
    expect(result.backendReachable).toBe(false);
  });

  it('posts a simulate request through the backend or falls back safely', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const result = await simulateFoundationContracts({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
      request: {
        city: 'karachi',
        requestedAt: '2026-05-18T08:00:00.000Z',
        source: 'settings',
      },
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/foundation-settings-backend-contracts/simulate',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.status).toBe('fallback');
    expect(result.events).toContain('Loaded non-secret settings contract');
  });
});
```

- [ ] **Step 3: Run the failing backend tests**

Run:

```powershell
npm test -- src/api/backendConfig.test.ts src/api/foundation.test.ts
```

Expected: fail with module resolution errors for `./backendConfig` and `./foundation`.

- [ ] **Step 4: Add backend config resolver**

Create `src/api/backendConfig.ts`:

```ts
import { Capacitor } from '@capacitor/core';

interface BackendBaseUrlOptions {
  rawBaseUrl?: string;
  isNativePlatform?: boolean;
}

export function getBackendBaseUrl(options: BackendBaseUrlOptions = {}): string | null {
  const raw = options.rawBaseUrl ?? import.meta.env.VITE_CIRO_API_BASE_URL ?? '';
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const native = options.isNativePlatform ?? Capacitor.isNativePlatform();
  if (native && parsed.protocol !== 'https:') return null;
  if (native && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) return null;

  return parsed.toString().replace(/\/+$/, '');
}
```

- [ ] **Step 5: Add foundation API client**

Create `src/api/foundation.ts`:

```ts
import {
  FOUNDATION_API_ROUTES,
  createFallbackP00Simulation,
  createFallbackP00Status,
  type P00BackendStatus,
  type P00SimulationRequest,
  type P00SimulationResponse,
} from '../foundation/contracts';
import { getBackendBaseUrl } from './backendConfig';

interface P00ApiOptions {
  baseUrl?: string | null;
  fetcher?: typeof fetch;
  now?: () => Date;
}

interface P00SimulationOptions extends P00ApiOptions {
  request: P00SimulationRequest;
}

function joinApiUrl(baseUrl: string, route: string): string {
  return `${baseUrl}${route}`;
}

export async function checkFoundationStatus(options: P00ApiOptions = {}): Promise<P00BackendStatus> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP00Status(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, FOUNDATION_API_ROUTES.status), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return createFallbackP00Status(nowIso);
    return await response.json() as P00BackendStatus;
  } catch {
    return createFallbackP00Status(nowIso);
  }
}

export async function simulateFoundationContracts(
  options: P00SimulationOptions,
): Promise<P00SimulationResponse> {
  const nowIso = (options.now ?? (() => new Date()))().toISOString();
  const baseUrl = options.baseUrl === undefined ? getBackendBaseUrl() : options.baseUrl;
  if (!baseUrl) return createFallbackP00Simulation(nowIso);

  try {
    const response = await (options.fetcher ?? fetch)(joinApiUrl(baseUrl, FOUNDATION_API_ROUTES.simulate), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.request),
    });
    if (!response.ok) return createFallbackP00Simulation(nowIso);
    return await response.json() as P00SimulationResponse;
  } catch {
    return createFallbackP00Simulation(nowIso);
  }
}
```

- [ ] **Step 6: Run the backend tests again**

Run:

```powershell
npm test -- src/api/backendConfig.test.ts src/api/foundation.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit**

```powershell
git add src/api/backendConfig.ts src/api/backendConfig.test.ts src/api/foundation.ts src/api/foundation.test.ts
git commit -m "feat: add p00 backend contract adapter"
```

---

## Task 5: Settings Page And Navigation

**Files:**
- Create: `src/pages/SettingsPage.tsx`
- Create: `src/pages/SettingsPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: Write the failing static render test**

Create `src/pages/SettingsPage.test.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsPage } from './SettingsPage';
import { useSettingsStore } from '../store/settingsStore';
import { useSessionStore } from '../store/sessionStore';

describe('SettingsPage', () => {
  afterEach(() => {
    useSettingsStore.getState().resetP00Settings();
    useSessionStore.getState().reset();
  });

  it('renders P00 foundation settings without secret inputs', () => {
    useSessionStore.getState().setP00Status('fallback', '2026-05-18T08:00:00.000Z');

    const html = renderToStaticMarkup(<SettingsPage />);

    expect(html).toContain('Foundation Settings');
    expect(html).toContain('Backend Contracts');
    expect(html).toContain('Mobile parity');
    expect(html).toContain('Bundled fallback');
    expect(html).not.toMatch(/api key/i);
    expect(html).not.toMatch(/secret/i);
    expect(html).not.toMatch(/token/i);
  });
});
```

- [ ] **Step 2: Run the failing page test**

Run:

```powershell
npm test -- src/pages/SettingsPage.test.tsx
```

Expected: fail because `SettingsPage` does not exist.

- [ ] **Step 3: Create `SettingsPage`**

Create `src/pages/SettingsPage.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { checkFoundationStatus, simulateFoundationContracts } from '../api/foundation';
import { Badge } from '../components/ui/Badge';
import { GlassPanel } from '../components/ui/GlassPanel';
import { colors } from '../constants/colors';
import { useCityStore } from '../store/cityStore';
import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsPage() {
  const city = useCityStore((state) => state.city);
  const p00 = useSettingsStore((state) => state.p00);
  const loadP00Settings = useSettingsStore((state) => state.loadP00Settings);
  const setP00Enabled = useSettingsStore((state) => state.setP00Enabled);
  const setP00MobileParity = useSettingsStore((state) => state.setP00MobileParity);
  const markP00Reviewed = useSettingsStore((state) => state.markP00Reviewed);
  const p00Status = useSessionStore((state) => state.p00Status);
  const p00LastUpdatedAt = useSessionStore((state) => state.p00LastUpdatedAt);
  const p00ErrorState = useSessionStore((state) => state.p00ErrorState);
  const setP00Status = useSessionStore((state) => state.setP00Status);
  const setP00ErrorState = useSessionStore((state) => state.setP00ErrorState);
  const [message, setMessage] = useState('Bundled fallback is available when the hosted backend is not configured.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadP00Settings();
  }, [loadP00Settings]);

  const runStatusCheck = async () => {
    setBusy(true);
    setP00Status('checking', new Date().toISOString());
    const result = await checkFoundationStatus();
    setP00Status(result.status, result.checkedAt);
    setMessage(result.message);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setBusy(false);
  };

  const runSimulation = async () => {
    setBusy(true);
    const requestedAt = new Date().toISOString();
    const result = await simulateFoundationContracts({
      request: {
        city,
        requestedAt,
        source: 'settings',
      },
    });
    setP00Status(result.status, result.simulatedAt);
    markP00Reviewed(result.simulatedAt);
    setMessage(`${result.message} ${result.events.join(' ')}`);
    setP00ErrorState(result.status === 'error' ? result.message : null);
    setBusy(false);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 desktop:px-6 desktop:py-6" style={{ background: colors.void }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: colors.amber }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDim }}>
                P00
              </span>
            </div>
            <h1 className="font-display text-3xl leading-tight" style={{ color: colors.textPrimary }}>
              Foundation Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: colors.textSecondary }}>
              Backend Contracts, non-secret preferences, mobile parity, and bundled fallback behavior for later CIRO features.
            </p>
          </div>
          <Badge label={p00Status} variant="status" />
        </header>

        <div className="grid gap-4 desktop:grid-cols-[1.2fr_0.8fr]">
          <GlassPanel className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Backend Contracts
                </h2>
                <p className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>
                  Calls use the configured CIRO API base URL. If the APK has no safe hosted backend, P00 uses bundled fallback data.
                </p>
              </div>
              <CloudOff size={18} style={{ color: colors.amber }} />
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={runStatusCheck}
                disabled={busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.raised,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderDefault}`,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <RefreshCw size={15} />
                Check status
              </button>
              <button
                type="button"
                onClick={runSimulation}
                disabled={busy}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold"
                style={{
                  background: colors.amberMuted,
                  color: colors.amber,
                  border: `1px solid ${colors.borderAmber}`,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={15} />
                Simulate contract
              </button>
            </div>

            <div className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ background: colors.raised, color: colors.textSecondary }}>
              {message}
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone size={18} style={{ color: colors.amber }} />
              <h2 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                Mobile parity
              </h2>
            </div>

            <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Foundation enabled</span>
              <input
                type="checkbox"
                checked={p00.enabled}
                onChange={(event) => setP00Enabled(event.currentTarget.checked)}
              />
            </label>

            <label className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg p-3" style={{ background: colors.raised }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Mobile parity</span>
              <input
                type="checkbox"
                checked={p00.mobileParity}
                onChange={(event) => setP00MobileParity(event.currentTarget.checked)}
              />
            </label>

            <dl className="mt-4 grid gap-2 text-xs" style={{ color: colors.textSecondary }}>
              <div className="flex justify-between gap-3">
                <dt>Last reviewed</dt>
                <dd style={{ color: colors.textPrimary }}>{p00.lastReviewedAt ?? 'Not reviewed'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last backend check</dt>
                <dd style={{ color: colors.textPrimary }}>{p00LastUpdatedAt ?? 'Not checked'}</dd>
              </div>
              {p00ErrorState && (
                <div className="rounded-lg p-2" style={{ background: 'rgba(248,113,113,0.12)', color: colors.danger }}>
                  {p00ErrorState}
                </div>
              )}
            </dl>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add route and navigation**

Modify `src/App.tsx`:

```tsx
import { SettingsPage } from './pages/SettingsPage'
```

Add the route:

```tsx
        <Route path="/settings" element={<SettingsPage />} />
```

Modify `src/components/layout/Sidebar.tsx` imports:

```tsx
import { Map, Radio, AlertTriangle, Truck, Terminal, GitCompare, Play, Sliders, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
```

Add this nav item at the end of `navItems`:

```tsx
  { path: '/settings',  icon: Settings,       label: 'Settings'  },
```

Modify `src/components/layout/TopBar.tsx` imports:

```tsx
import { Activity, MapPin, ChevronDown, Check, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
```

Inside `TopBar`, add:

```tsx
  const navigate = useNavigate();
```

Replace the final empty right column:

```tsx
      <div aria-hidden="true" />
```

with:

```tsx
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Open settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            background: colors.raised,
            color: colors.textSecondary,
            border: `1px solid ${colors.borderDefault}`,
          }}
        >
          <Settings size={16} />
        </button>
      </div>
```

- [ ] **Step 5: Run page and route tests**

Run:

```powershell
npm test -- src/pages/SettingsPage.test.tsx
```

Expected: pass.

- [ ] **Step 6: Commit**

```powershell
git add src/pages/SettingsPage.tsx src/pages/SettingsPage.test.tsx src/App.tsx src/components/layout/Sidebar.tsx src/components/layout/TopBar.tsx
git commit -m "feat: add p00 settings surface"
```

---

## Task 6: Stable Foundation Map Layers

**Files:**
- Create: `src/components/map/foundationLayers.ts`
- Create: `src/components/map/foundationLayers.test.ts`
- Modify: `src/components/map/CiroMap.tsx`

- [ ] **Step 1: Write failing map helper tests**

Create `src/components/map/foundationLayers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { FOUNDATION_MAP_LAYER_IDS } from '../../foundation/contracts';
import { createFoundationFeatureCollection } from './foundationLayers';

describe('foundation map layers', () => {
  it('creates a city-scoped feature collection for P00 layer data', () => {
    const data = createFoundationFeatureCollection('karachi');

    expect(data.features).toHaveLength(1);
    expect(data.features[0].properties).toEqual({
      id: 'p00-karachi',
      title: 'P00 backend contract anchor',
    });
  });

  it('uses the public P00 map layer identifiers', () => {
    expect(FOUNDATION_MAP_LAYER_IDS.primary).toBe('ciro-foundation-settings-backend-contracts-primary');
    expect(FOUNDATION_MAP_LAYER_IDS.labels).toBe('ciro-foundation-settings-backend-contracts-labels');
  });
});
```

- [ ] **Step 2: Run the failing map helper test**

Run:

```powershell
npm test -- src/components/map/foundationLayers.test.ts
```

Expected: fail because `foundationLayers` does not exist.

- [ ] **Step 3: Add the MapLibre helper**

Create `src/components/map/foundationLayers.ts`:

```ts
import type maplibregl from 'maplibre-gl';
import { CITY_COORDS } from '../../constants/mapStyles';
import { FOUNDATION_MAP_LAYER_IDS } from '../../foundation/contracts';
import type { City } from '../../types';

export function createFoundationFeatureCollection(city: City): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: CITY_COORDS[city].center,
        },
        properties: {
          id: `p00-${city}`,
          title: 'P00 backend contract anchor',
        },
      },
    ],
  };
}

export function syncFoundationLayers(map: maplibregl.Map, city: City, enabled: boolean): void {
  if (!map.isStyleLoaded()) return;

  if (!enabled) {
    removeFoundationLayers(map);
    return;
  }

  const data = createFoundationFeatureCollection(city);
  const existingSource = map.getSource(FOUNDATION_MAP_LAYER_IDS.source) as maplibregl.GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
  } else {
    map.addSource(FOUNDATION_MAP_LAYER_IDS.source, {
      type: 'geojson',
      data,
    });
  }

  if (!map.getLayer(FOUNDATION_MAP_LAYER_IDS.primary)) {
    map.addLayer({
      id: FOUNDATION_MAP_LAYER_IDS.primary,
      type: 'circle',
      source: FOUNDATION_MAP_LAYER_IDS.source,
      paint: {
        'circle-radius': 9,
        'circle-color': '#f59e0b',
        'circle-opacity': 0.22,
        'circle-stroke-color': '#f59e0b',
        'circle-stroke-width': 1,
      },
    });
  }

  if (!map.getLayer(FOUNDATION_MAP_LAYER_IDS.labels)) {
    map.addLayer({
      id: FOUNDATION_MAP_LAYER_IDS.labels,
      type: 'symbol',
      source: FOUNDATION_MAP_LAYER_IDS.source,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 10,
        'text-offset': [0, 1.2],
      },
      paint: {
        'text-color': '#fbbf24',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    });
  }
}

export function removeFoundationLayers(map: maplibregl.Map): void {
  if (map.getLayer(FOUNDATION_MAP_LAYER_IDS.labels)) {
    map.removeLayer(FOUNDATION_MAP_LAYER_IDS.labels);
  }
  if (map.getLayer(FOUNDATION_MAP_LAYER_IDS.primary)) {
    map.removeLayer(FOUNDATION_MAP_LAYER_IDS.primary);
  }
  if (map.getSource(FOUNDATION_MAP_LAYER_IDS.source)) {
    map.removeSource(FOUNDATION_MAP_LAYER_IDS.source);
  }
}
```

- [ ] **Step 4: Wire layers into `CiroMap`**

Modify `src/components/map/CiroMap.tsx` imports:

```tsx
import { syncFoundationLayers, removeFoundationLayers } from './foundationLayers';
import { useSettingsStore } from '../../store/settingsStore';
```

Inside `CiroMap`, add:

```tsx
  const foundationEnabled = useSettingsStore((s) => s.p00.enabled);
```

Inside the map `load` callback, after route layer initialization:

```tsx
      syncFoundationLayers(mapInstance.current!, city, foundationEnabled);
```

Add this effect after the city fly-to effect:

```tsx
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    const sync = () => syncFoundationLayers(map, city, foundationEnabled);
    if (map.isStyleLoaded()) sync();
    else map.once('load', sync);
  }, [city, foundationEnabled]);
```

In the cleanup effect, before marker cleanup or inside the existing cleanup callback:

```tsx
      if (mapInstance.current) removeFoundationLayers(mapInstance.current);
```

- [ ] **Step 5: Run the map helper test**

Run:

```powershell
npm test -- src/components/map/foundationLayers.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

```powershell
git add src/components/map/foundationLayers.ts src/components/map/foundationLayers.test.ts src/components/map/CiroMap.tsx
git commit -m "feat: add p00 foundation map layers"
```

---

## Task 7: Full Verification And APK Parity Check

**Files:** None unless generated build artifacts are intentionally committed. Do not commit `dist/`.

- [ ] **Step 1: Confirm worktree scope**

Run:

```powershell
git status --short
```

Expected: either clean, or only known files from the active task before commit.

- [ ] **Step 2: Run targeted P00 tests**

Run:

```powershell
npm test -- src/foundation/contracts.test.ts src/store/settingsStore.test.ts src/store/sessionStore.test.ts src/api/backendConfig.test.ts src/api/foundation.test.ts src/pages/SettingsPage.test.tsx src/components/map/foundationLayers.test.ts
```

Expected: all listed tests pass.

- [ ] **Step 3: Run repo-required verification**

Run:

```powershell
npm run lint
npm test
npm run build
```

Expected:
- `npm run lint` exits 0.
- `npm test` exits 0.
- `npm run build` exits 0 and preserves Vite `base: './'`.

- [ ] **Step 4: Run Capacitor sync**

Run:

```powershell
npx cap sync android
```

Expected: sync completes without requiring frontend secrets or localhost-only backend configuration.

- [ ] **Step 5: Mobile browser verification**

Start the dev server:

```powershell
npm run dev
```

Use browser device emulation at `390x844` and `420x915`.

Verify:
- Settings icon in `TopBar` is tappable.
- `/settings` scrolls vertically and does not overlap `BottomNav`.
- P00 toggles are at least 44px tall and usable by touch.
- Check status works with no backend configured and shows bundled fallback.
- Simulate contract works with no backend configured and updates last reviewed time.
- Returning to `/` leaves map, mobile operations dock, Simulate, manual dispatch, AI dispatch, trace, impact, and resource return behavior available.
- No raw API keys, provider keys, secrets, or tokens appear in localStorage.

- [ ] **Step 6: APK-oriented verification**

Build and sync:

```powershell
npm run build
npx cap sync android
```

If Android tooling is available:

```powershell
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location
```

Expected APK path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Verify on device or emulator:
- Settings route is reachable by touch.
- Hosted backend is optional; fallback status does not crash.
- The APK does not assume `localhost`.
- P00 map layers do not block crisis markers, vehicle markers, or route lines.
- Safe-area and bottom nav remain usable.

- [ ] **Step 7: Secret custody audit**

Run:

```powershell
rg -n "API_KEY|SECRET|TOKEN|VITE_.*KEY|localStorage\\.setItem" src
```

Expected for P00-owned files:
- No provider key env var usage.
- No localStorage storage except the three approved `FOUNDATION_SETTING_KEYS`.

If existing legacy hits appear in `src/api/routing.ts` or `src/api/weather.ts`, record them as pre-existing residual risk unless the user explicitly asks to fold their migration into P00.

- [ ] **Step 8: Final atomic commit if verification changed files**

If only build outputs changed and those outputs are ignored, do not commit. If Capacitor metadata changed and belongs to P00, stage only those files:

```powershell
git add <exact changed capacitor files>
git commit -m "build: sync android after p00 foundation contracts"
```

---

## Self-Review Against P00 HTML Plan

| P00 Requirement | Covered By |
|---|---|
| Settings shell | Task 5 |
| Feature flag vocabulary | Task 1 and Task 2 |
| API base configuration | Task 4 |
| Shared contracts | Task 1 |
| No API secrets in frontend/localStorage/APK | Task 2, Task 4, Task 7 |
| `p00Status` store field | Task 3 |
| `p00LastUpdatedAt` store field | Task 3 |
| `p00ErrorState` store field | Task 3 |
| `GET /api/foundation-settings-backend-contracts/status` | Task 4 |
| `POST /api/foundation-settings-backend-contracts/simulate` | Task 4 |
| Map layer `ciro-foundation-settings-backend-contracts-primary` | Task 6 |
| Map layer `ciro-foundation-settings-backend-contracts-labels` | Task 6 |
| Preserve current CIRO simulation loop | Task 3, Task 5, Task 6, Task 7 |
| Mobile/APK parity | Task 5 and Task 7 |
| Atomic commits | Every task commit step |

## Residual Risk To Report After Implementation

- The current repo already contains direct frontend provider key reads in `src/api/routing.ts` and `src/api/weather.ts`. P00 must not add new frontend secret paths. Migrating existing route/weather provider calls to backend custody should be a separate atomic task unless the user explicitly expands P00.
- This plan adds a visible `/settings` route and a TopBar settings icon. It does not redesign the app shell or replace the existing mobile bottom nav.
- The backend endpoints are contract clients only. A hosted backend implementation is outside this P00 frontend foundation slice unless the user asks for a backend workstream.
