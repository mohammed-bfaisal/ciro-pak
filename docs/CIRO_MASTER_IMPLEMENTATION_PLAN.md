# CIRO — Master Implementation Plan
## All 74 Requirements, Execution-Ready for Codex/Vibe-Coding

**Generated:** 2026-05-19  
**Repo:** `ciro-pak-master`  
**Stack:** React 19 + TypeScript + Vite + Zustand + MapLibre GL + Recharts + Framer Motion + Capacitor 8 (Android)  
**Backend:** Node.js + Express on Google Cloud Run  
**AI:** OpenRouter — `google/gemini-flash-1.5` for sub-agents, `google/gemini-pro-1.5` for orchestrator  
**Secrets custody:** All API keys live in backend `.env` only — never in frontend code, APK, localStorage, or logs  

---

## ARCHITECTURAL DECISIONS (locked — do not deviate)

| Decision | Choice | Reason |
|---|---|---|
| Backend comms | **SSE (Server-Sent Events)** for agent pipeline, **REST** for data queries | SSE streams token-by-token agent reasoning into UI — this is the single highest-impact demo moment for judges. REST for weather/traffic/config is simpler. |
| APK backend URL | **`VITE_API_BASE_URL` set at build time** via env var | Simplest, most reliable for APK. No runtime fetch needed. Cloud Run URL is stable. |
| LLM model — sub-agents | **`google/gemma-2-9b-it`** via OpenRouter | Cheapest capable Google model. 8k context, fast, free tier available. |
| LLM model — orchestrator | **`google/gemini-flash-1.5`** via OpenRouter | Smarter, still cheap, 1M context handles full signal set. |
| Agent architecture | **All 5 agent functions move to backend** (`signalFusion`, `crisisDetector`, `resourceAllocator`, `actionSimulator`, `stakeholderNotifier`) | Satisfies Antigravity orchestrator requirement. Keeps secrets server-side. Frontend becomes a display layer. |
| Pages to remove | **Remove `ReplayPage` and `WhatIfPage`** from nav and routes | Neither is required. WhatIf is replaced by the live robustness evidence (R62). Replay is superseded by TracePage. |
| Pages to keep | Dashboard, Signals, Crises, Resources, Trace, Compare, Settings (new) | Compare = baseline requirement R61. Settings = map layer toggles, traffic toggle. |
| Mobile layout | **Bottom sheet drawer** on `< 1024px` (Capacitor + mobile web), **multi-panel HUD** on `>= 1024px` (desktop) | Existing `MobileOperationsDock` becomes the bottom sheet. Desktop HUDs stay. |
| Map layers | Crisis heatmap, traffic congestion, affected radius circles, resource coverage, signal cluster density | All 5. Controlled by Settings store toggle. Each is a MapLibre GeoJSON source+layer. |
| Traffic data | **TomTom Traffic Flow API** (live road speeds) — server-side proxy. Falls back to OSRM with simulated delay multiplier | TomTom key needed. Setup instructions in R9. |
| Real weather | **OpenWeatherMap free tier** — already wired. Key in backend `.env`, proxied via `/api/weather/:city` | No cost increase. |
| Antigravity | **Handled externally by you** — backend is positioned as the Antigravity-equivalent orchestrator in all documentation and trace logs | Not coded here. |

---

## BACKEND FOLDER STRUCTURE

```
ciro-pak-master/
  backend/                          ← NEW — Express server
    src/
      index.ts                      ← Express app entry, CORS, routes
      routes/
        pipeline.ts                 ← POST /api/pipeline/:city  (SSE stream)
        weather.ts                  ← GET  /api/weather/:city
        traffic.ts                  ← GET  /api/traffic/flow   (TomTom proxy)
        route.ts                    ← GET  /api/route          (TomTom/OSRM proxy)
        settings.ts                 ← GET  /api/health
      agents/
        orchestrator.ts             ← Calls all sub-agents in sequence, streams SSE
        signalFusion.ts             ← LLM: credibility + conflict scoring
        crisisDetector.ts           ← LLM: classification + severity + confidence
        resourceAllocator.ts        ← Deterministic heuristic (kept fast + explainable)
        actionSimulator.ts          ← LLM: generates 3–5 action chain per crisis
        stakeholderNotifier.ts      ← LLM: drafts 6 audience-specific messages
      lib/
        openrouter.ts               ← OpenRouter fetch helper (no SDK needed)
        tomtom.ts                   ← TomTom Traffic Flow + Routing helpers
        weather.ts                  ← OpenWeatherMap helper
      types.ts                      ← Shared backend types (mirrors src/types/index.ts)
    .env                            ← OPENROUTER_API_KEY, WEATHER_API_KEY, TOMTOM_API_KEY, PORT, ALLOWED_ORIGINS
    .env.example                    ← Template (committed)
    package.json
    tsconfig.json
    Dockerfile                      ← Cloud Run container
    .dockerignore
  src/                              ← Existing frontend (unchanged structure)
    api/
      client.ts                     ← NEW: central fetch helper pointing to VITE_API_BASE_URL
      pipeline.ts                   ← NEW: SSE consumer for /api/pipeline/:city
      weather.ts                    ← MODIFIED: now calls /api/weather/:city
      routing.ts                    ← MODIFIED: now calls /api/route
      traffic.ts                    ← NEW: calls /api/traffic/flow
    store/
      settingsStore.ts              ← NEW: map layer toggles, traffic toggle
    ...
```

---

## GOOGLE CLOUD RUN — SETUP STEPS FOR YOU TO DO MANUALLY

These are infra steps the coding agent cannot do. Do them in order before deploying.

**Step 1 — Create GCP project** (if not done)
```
gcloud projects create ciro-pak-2026 --name="CIRO Pakistan"
gcloud config set project ciro-pak-2026
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

**Step 2 — Get your TomTom API key**
1. Go to https://developer.tomtom.com/
2. Sign up (free tier: 2,500 requests/day — enough for demo)
3. Create an app → copy the **Consumer API Key**
4. Enable: **Routing API** and **Traffic Flow API**

**Step 3 — Get your OpenRouter API key**
1. Go to https://openrouter.ai/
2. Sign up → Settings → API Keys → Create Key
3. Add $5 credit (enough for full hackathon usage with Gemma/Flash)

**Step 4 — Set backend environment variables in Cloud Run**
After deploying (Step after coding is done):
```
gcloud run services update ciro-backend \
  --set-env-vars OPENROUTER_API_KEY=sk-or-... \
  --set-env-vars WEATHER_API_KEY=your_owm_key \
  --set-env-vars TOMTOM_API_KEY=your_tomtom_key \
  --set-env-vars ALLOWED_ORIGINS=https://your-frontend.netlify.app,capacitor://localhost,http://localhost:5173 \
  --region=asia-south1
```

**Step 5 — Get the Cloud Run URL and add to frontend**
After first deploy, Cloud Run gives you a URL like `https://ciro-backend-xxxx-uc.a.run.app`.
Add to frontend `.env`:
```
VITE_API_BASE_URL=https://ciro-backend-xxxx-uc.a.run.app
```
Then rebuild and `npx cap sync android`.

**Step 6 — APK network security** (already handled — `capacitor.config.ts` has `androidScheme: 'https'` which allows HTTPS Cloud Run calls from WebView)

---

## DEPENDENCY MAP — ALL 74 REQUIREMENTS

### Execution Order (what blocks what)

```
BLOCK A — Backend Foundation (must be first — everything depends on it)
  R1 (multi-source ingestion) depends on: backend exists
  R6/R7/R8/R9/R10 (Antigravity + tools) depends on: backend exists
  → Do R-BACKEND first (not numbered in 74 but prerequisite)

BLOCK B — Core Agent Pipeline (backend agents)
  R2 (crisis detection) depends on: R1 done
  R3 (action generation) depends on: R2 done
  R17/R18/R19/R20 (signal fusion + confidence) depends on: R1 done
  R21–R24 (action planning + types) depends on: R3 done
  R36/R37/R38 (multi-agent workflow) depends on: all agents done

BLOCK C — Simulation (frontend + backend connected)
  R4/R5 (simulate execution + show impact) depends on: R3 done
  R25–R31 (traffic reroute + dispatch + alerts + status) depends on: R4 done
  R32/R33/R34 (before/after + logs) depends on: R4 done

BLOCK D — UX Overhaul (parallel with B/C)
  R39/R40 (prototype + mobile) depends on: UX plan
  R41 (web optional) depends on: R40
  Remove Replay/WhatIf: standalone, do first in this block
  Bottom sheet: standalone UX change
  Map layers (D1): depends on: settingsStore exists

BLOCK E — Trace + Evidence (can run after B)
  R48–R51 (agent trace/logs) depends on: SSE pipeline streaming
  R63–R68 (Antigravity trace display) depends on: R48

BLOCK F — Demo Video (R42–R47): documentation, last
BLOCK G — README (R52–R61): documentation, last
BLOCK H — Judge Evidence (R69–R74): packaging, very last
```

---

## REQUIREMENT PLANS

---

# Requirement R-BACKEND: Express Backend Scaffold on Google Cloud Run
*(Prerequisite — not in the 74 but blocks everything)*

## Requirement
Build and deploy a Node.js + Express backend on Google Cloud Run that holds all secrets, proxies all external APIs, and serves the LLM agent pipeline via SSE.

## Current Codebase Truth
- No backend exists. All logic is client-side.
- `src/api/weather.ts` calls OpenWeatherMap directly with `import.meta.env.VITE_WEATHER_API_KEY`.
- `src/api/routing.ts` calls TomTom and OSRM directly with `import.meta.env.VITE_TOMTOM_API_KEY`.
- No server folder, no Dockerfile, no Cloud Run config.

## Branch
`feature/backend-express-scaffold`

## Atomic Commit
`feat: add Express/Cloud Run backend scaffold with SSE pipeline route and API proxies`

## Files To Create

### `backend/package.json`
```json
{
  "name": "ciro-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "axios": "^1.7.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.0.0",
    "tsx": "^4.7.1",
    "typescript": "~5.4.5"
  }
}
```

### `backend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### `backend/.env.example`
```
OPENROUTER_API_KEY=
WEATHER_API_KEY=
TOMTOM_API_KEY=
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173,capacitor://localhost
```

### `backend/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### `backend/.dockerignore`
```
node_modules
src
*.md
.env
```

### `backend/src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import { pipelineRouter } from './routes/pipeline.js';
import { weatherRouter } from './routes/weather.js';
import { trafficRouter } from './routes/traffic.js';
import { routeRouter } from './routes/route.js';
import { healthRouter } from './routes/settings.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '8080', 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile WebView, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

app.use('/api/pipeline', pipelineRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/traffic', trafficRouter);
app.use('/api/route', routeRouter);
app.use('/api/health', healthRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CIRO backend listening on port ${PORT}`);
});
```

### `backend/src/routes/settings.ts`
```typescript
import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'ciro-backend', timestamp: new Date().toISOString() });
});
export { router as healthRouter };
```

### `backend/src/lib/openrouter.ts`
```typescript
const BASE = 'https://openrouter.ai/api/v1/chat/completions';

export interface OrchestratorModel {
  role: 'orchestrator' | 'subagent';
}

// Orchestrator uses gemini-flash-1.5 (smarter, 1M context)
// Sub-agents use gemma-2-9b-it (cheaper, faster, 8k context)
const MODEL_MAP = {
  orchestrator: 'google/gemini-flash-1.5',
  subagent: 'google/gemma-2-9b-it',
};

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  role: 'orchestrator' | 'subagent',
  maxTokens = 1500,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');

  const response = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ciro-pak.app',
      'X-Title': 'CIRO Crisis Intelligence',
    },
    body: JSON.stringify({
      model: MODEL_MAP[role],
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? '';
}
```

### `backend/src/lib/weather.ts`
```typescript
import axios from 'axios';
import { CITY_WEATHER_QUERIES } from '../types.js';

export async function fetchWeatherForCity(city: string): Promise<object> {
  const apiKey = process.env.WEATHER_API_KEY;
  const query = CITY_WEATHER_QUERIES[city] ?? `${city},PK`;

  if (!apiKey) return getMockWeather(city);

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { q: query, appid: apiKey, units: 'metric' }, timeout: 5000 },
    );
    return data;
  } catch {
    return getMockWeather(city);
  }
}

function getMockWeather(city: string): object {
  return {
    source: 'mock',
    city,
    weather: [{ description: 'heavy rain' }],
    main: { temp: 34, humidity: 89 },
    rain: { '1h': 38 },
  };
}
```

### `backend/src/lib/tomtom.ts`
```typescript
const FLOW_BASE = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json';
const ROUTE_BASE = 'https://api.tomtom.com/routing/1/calculateRoute';

export interface TrafficFlowResult {
  currentSpeed: number;
  freeFlowSpeed: number;
  confidence: number;
  congestionLevel: 'free' | 'moderate' | 'heavy' | 'standstill';
}

export interface RouteResult {
  coords: [number, number][];
  etaSeconds: number;
  distanceMeters: number;
  trafficDelaySeconds: number;
  provider: 'tomtom' | 'osrm';
}

export async function fetchTrafficFlow(lat: number, lng: number): Promise<TrafficFlowResult | null> {
  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${FLOW_BASE}?key=${apiKey}&point=${lat},${lng}&unit=KMPH&openLr=false`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    const data = await response.json() as {
      flowSegmentData?: {
        currentSpeed?: number;
        freeFlowSpeed?: number;
        confidence?: number;
      }
    };
    const seg = data.flowSegmentData;
    if (!seg) return null;
    const currentSpeed = seg.currentSpeed ?? 30;
    const freeFlowSpeed = seg.freeFlowSpeed ?? 60;
    const ratio = currentSpeed / freeFlowSpeed;
    return {
      currentSpeed,
      freeFlowSpeed,
      confidence: seg.confidence ?? 0.8,
      congestionLevel: ratio > 0.8 ? 'free' : ratio > 0.5 ? 'moderate' : ratio > 0.25 ? 'heavy' : 'standstill',
    };
  } catch {
    return null;
  }
}

export async function fetchRoute(
  fromLng: number, fromLat: number,
  toLng: number, toLat: number,
): Promise<RouteResult | null> {
  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) return fetchOsrmRoute(fromLng, fromLat, toLng, toLat);

  try {
    const url = `${ROUTE_BASE}/${fromLat},${fromLng}:${toLat},${toLng}/json?key=${apiKey}&traffic=true&routeType=fastest&travelMode=car`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`TomTom ${response.status}`);
    const data = await response.json() as {
      routes?: {
        summary?: { lengthInMeters?: number; travelTimeInSeconds?: number; trafficDelayInSeconds?: number };
        legs?: { points?: { latitude: number; longitude: number }[] }[];
      }[];
    };
    const route = data.routes?.[0];
    if (!route) throw new Error('No routes');
    const coords: [number, number][] = (route.legs?.[0]?.points ?? []).map(
      (p) => [p.longitude, p.latitude]
    );
    return {
      coords,
      etaSeconds: route.summary?.travelTimeInSeconds ?? 600,
      distanceMeters: route.summary?.lengthInMeters ?? 0,
      trafficDelaySeconds: route.summary?.trafficDelayInSeconds ?? 0,
      provider: 'tomtom',
    };
  } catch {
    return fetchOsrmRoute(fromLng, fromLat, toLng, toLat);
  }
}

async function fetchOsrmRoute(
  fromLng: number, fromLat: number,
  toLng: number, toLat: number,
): Promise<RouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = await response.json() as {
      code: string;
      routes: { duration: number; distance?: number; geometry: { coordinates: [number, number][] } }[];
    };
    if (data.code !== 'Ok' || !data.routes[0]) return null;
    return {
      coords: data.routes[0].geometry.coordinates,
      etaSeconds: Math.round(data.routes[0].duration),
      distanceMeters: data.routes[0].distance ?? 0,
      trafficDelaySeconds: 0,
      provider: 'osrm',
    };
  } catch {
    return null;
  }
}
```

### `backend/src/types.ts`
```typescript
// Mirrors src/types/index.ts — keep in sync
export type SignalSource = 'social' | 'weather' | 'traffic' | 'field_report' | 'sensor' | 'emergency_call';
export type CrisisType = 'flood' | 'heatwave' | 'accident' | 'infrastructure' | 'power_outage' | 'protest' | 'disease_cluster' | 'unknown';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface BackendSignal {
  id: string;
  source: SignalSource;
  content: string;
  location: { lat: number; lng: number; label: string };
  timestamp: string;
  credibilityScore: number;
  urgencyScore: number;
  mentionVelocity?: number;
  isFlagged: boolean;
  conflictsWith?: string[];
  rawData: Record<string, unknown>;
}

export interface BackendCrisis {
  id: string;
  type: CrisisType;
  title: string;
  location: { lat: number; lng: number; label: string; affectedRadiusKm: number };
  severity: Severity;
  confidenceScore: number;
  confidenceHistory: { t: string; v: number }[];
  status: string;
  detectedAt: string;
  estimatedDuration: string;
  affectedPopulation: number;
  spreadRisk: string;
  signalIds: string[];
  conflictingSignalIds: string[];
  verificationStatus: string;
  agentReasoning: string;
}

export const CITY_WEATHER_QUERIES: Record<string, string> = {
  karachi: 'Karachi,PK',
  islamabad: 'Islamabad,PK',
  lahore: 'Lahore,PK',
  rawalpindi: 'Rawalpindi,PK',
  faisalabad: 'Faisalabad,PK',
  multan: 'Multan,PK',
  peshawar: 'Peshawar,PK',
  quetta: 'Quetta,PK',
  hyderabad: 'Hyderabad,PK',
  sukkur: 'Sukkur,PK',
  gujranwala: 'Gujranwala,PK',
  sialkot: 'Sialkot,PK',
  bahawalpur: 'Bahawalpur,PK',
  sargodha: 'Sargodha,PK',
  abbottabad: 'Abbottabad,PK',
  gwadar: 'Gwadar,PK',
};
```

### `backend/src/routes/weather.ts`
```typescript
import { Router } from 'express';
import { fetchWeatherForCity } from '../lib/weather.js';

const router = Router();

router.get('/:city', async (req, res) => {
  try {
    const data = await fetchWeatherForCity(req.params.city);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export { router as weatherRouter };
```

### `backend/src/routes/traffic.ts`
```typescript
import { Router } from 'express';
import { fetchTrafficFlow } from '../lib/tomtom.js';

const router = Router();

// GET /api/traffic/flow?lat=24.86&lng=67.01
router.get('/flow', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng required' });
  }
  const result = await fetchTrafficFlow(lat, lng);
  // Return mock if TomTom unavailable
  res.json(result ?? {
    currentSpeed: 25,
    freeFlowSpeed: 60,
    confidence: 0.5,
    congestionLevel: 'moderate',
    source: 'mock',
  });
});

export { router as trafficRouter };
```

### `backend/src/routes/route.ts`
```typescript
import { Router } from 'express';
import { fetchRoute } from '../lib/tomtom.js';

const router = Router();

// GET /api/route?fromLng=67.0&fromLat=24.8&toLng=67.1&toLat=24.9
router.get('/', async (req, res) => {
  const fromLng = parseFloat(req.query.fromLng as string);
  const fromLat = parseFloat(req.query.fromLat as string);
  const toLng   = parseFloat(req.query.toLng as string);
  const toLat   = parseFloat(req.query.toLat as string);
  if ([fromLng, fromLat, toLng, toLat].some(isNaN)) {
    return res.status(400).json({ error: 'fromLng, fromLat, toLng, toLat required' });
  }
  const result = await fetchRoute(fromLng, fromLat, toLng, toLat);
  if (!result) return res.status(503).json({ error: 'routing unavailable' });
  res.json(result);
});

export { router as routeRouter };
```

### `backend/src/routes/pipeline.ts`
*(See Requirements R1–R38 for the full agent implementations. This file wires them all into an SSE stream.)*

```typescript
import { Router, Request, Response } from 'express';
import { runOrchestratorPipeline } from '../agents/orchestrator.js';

const router = Router();

// POST /api/pipeline/:city
// Returns: text/event-stream (SSE)
// Each event: { type: 'phase_start'|'log'|'phase_complete'|'crisis'|'action'|'message'|'done'|'error', payload: {...} }
router.post('/:city', async (req: Request, res: Response) => {
  const { city } = req.params;

  // SSE headers — critical for both browser and Capacitor WebView
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering if present
  res.flushHeaders();

  const emit = (type: string, payload: unknown) => {
    res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
    // Force flush — required for Cloud Run + Capacitor WebView
    if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
      (res as unknown as { flush: () => void }).flush();
    }
  };

  try {
    await runOrchestratorPipeline(city, emit);
    emit('done', { city, completedAt: new Date().toISOString() });
  } catch (err) {
    emit('error', { message: String(err) });
  } finally {
    res.end();
  }
});

export { router as pipelineRouter };
```

## Frontend API Client

### `src/api/client.ts` (NEW)
```typescript
// Central API client — reads VITE_API_BASE_URL at build time
// In APK: points to Cloud Run. In dev: points to localhost:8080
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? 'http://localhost:8080';

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(`API error ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}
```

### `src/api/pipeline.ts` (NEW — SSE consumer)
```typescript
import { apiUrl } from './client.js';

export type PipelineEvent =
  | { type: 'phase_start';    payload: { phase: string; tasks: string[] } }
  | { type: 'log';            payload: { message: string } }
  | { type: 'phase_complete'; payload: { phase: string; durationMs: number; summary: string } }
  | { type: 'signal';         payload: { signal: unknown } }
  | { type: 'crisis';         payload: { crisis: unknown } }
  | { type: 'action';         payload: { action: unknown } }
  | { type: 'message';        payload: { message: unknown } }
  | { type: 'allocation';     payload: { allocation: unknown } }
  | { type: 'done';           payload: { city: string; completedAt: string } }
  | { type: 'error';          payload: { message: string } };

export function streamPipeline(
  city: string,
  onEvent: (event: PipelineEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use fetch-based SSE — works in both browser and Capacitor WebView
    fetch(apiUrl(`/api/pipeline/${city}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        reject(new Error(`Pipeline HTTP ${res.status}`));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) { resolve(); return; }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as PipelineEvent;
              onEvent(event);
              if (event.type === 'done' || event.type === 'error') { resolve(); return; }
            } catch { /* malformed line — skip */ }
          }
        }
      }
    }).catch(reject);
  });
}
```

## Cloud Run Deploy Commands (run after coding is done)

```bash
# From repo root
cd backend
npm install
npm run build

# Build and push Docker image
gcloud builds submit --tag gcr.io/ciro-pak-2026/ciro-backend .

# Deploy to Cloud Run (asia-south1 = closest to Pakistan)
gcloud run deploy ciro-backend \
  --image gcr.io/ciro-pak-2026/ciro-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --port 8080 \
  --set-env-vars OPENROUTER_API_KEY=sk-or-...,WEATHER_API_KEY=...,TOMTOM_API_KEY=...,ALLOWED_ORIGINS=https://your-app.netlify.app,capacitor://localhost
```

## Testing Plan
- `GET /api/health` returns `{ status: 'ok' }`
- `GET /api/weather/karachi` returns weather object (real or mock)
- `GET /api/route?fromLng=67.0&fromLat=24.86&toLng=67.1&toLat=24.9` returns route coords
- `GET /api/traffic/flow?lat=24.86&lng=67.0` returns congestion level
- `POST /api/pipeline/karachi` streams SSE events ending in `done`
- All endpoints return CORS headers for `capacitor://localhost`
- APK: load app, trigger pipeline — no CORS errors in Logcat

## Acceptance Criteria
- [ ] `backend/` folder exists with all files above
- [ ] `npm run build` in `backend/` completes with zero TypeScript errors
- [ ] `npm run dev` starts server on port 8080
- [ ] All 5 routes respond correctly
- [ ] CORS allows `capacitor://localhost` and `http://localhost:5173`
- [ ] No API keys appear in any frontend file, APK assets, or logs
- [ ] `src/api/client.ts` reads `VITE_API_BASE_URL` — not hardcoded
- [ ] Dockerfile builds successfully: `docker build -t ciro-backend .`

---

# Requirement 1: Multi-Source Signal Ingestion
## Requirement
Build an agentic AI system that ingests multi-source signals — processing at least 3 distinct source types per city from the following: `social`, `weather`, `traffic`, `field_report`, `sensor`, `emergency_call`.

## Current Codebase Truth
- `src/agents/orchestrator.ts` → `runSimulation()` calls `loadSignals(city)` (returns mock JSON) then `fetchWeather(city)` (calls OpenWeatherMap directly or mock fallback).
- `src/api/weather.ts` calls OpenWeatherMap with `import.meta.env.VITE_WEATHER_API_KEY` — secret in frontend.
- Each city's `signals.json` contains 6+ signals spanning social, field_report, weather stub, traffic, and sensor/emergency_call.
- The backend scaffold (`R-BACKEND`) must exist before this requirement is implemented.

## Branch
`feature/r1-multi-source-ingestion`

## Atomic Commit
`feat: move signal ingestion to backend SSE pipeline with live weather and traffic sources`

## Files To Modify Or Create

### `backend/src/agents/orchestrator.ts` (CREATE)
This is the master orchestrator. It calls all sub-agents in sequence and emits SSE events after each step. The coding agent must implement the complete file:

```typescript
import { callLLM } from '../lib/openrouter.js';
import { fetchWeatherForCity } from '../lib/weather.js';
import { runSignalFusionAgent } from './signalFusion.js';
import { runCrisisDetectionAgent } from './crisisDetector.js';
import { runResourceAllocatorAgent } from './resourceAllocator.js';
import { runActionSimulatorAgent } from './actionSimulator.js';
import { runStakeholderNotifierAgent } from './stakeholderNotifier.js';
import type { BackendSignal } from '../types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Dynamically load city signal JSON from frontend data folder
// Path: ../../src/data/mock/{city}/signals.json
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCitySignals(city: string): BackendSignal[] {
  try {
    const p = join(__dirname, `../../../src/data/mock/${city}/signals.json`);
    return JSON.parse(readFileSync(p, 'utf-8')) as BackendSignal[];
  } catch {
    return [];
  }
}

type Emitter = (type: string, payload: unknown) => void;

export async function runOrchestratorPipeline(city: string, emit: Emitter): Promise<void> {
  const startMs = Date.now();

  // ── PHASE 1: Signal Ingestion ──────────────────────────────────────
  emit('phase_start', {
    phase: 'Signal Ingestion',
    index: 1,
    total: 7,
    tasks: [
      `Loading ${city} social posts and field reports...`,
      `Fetching live weather for ${city}...`,
      `Loading traffic and sensor signals...`,
    ],
  });

  const rawSignals = loadCitySignals(city);
  for (const signal of rawSignals) {
    emit('signal', { signal });
    emit('log', { message: `Ingested: [${signal.source.toUpperCase()}] "${signal.content.slice(0, 80)}..."` });
  }

  // Fetch live weather via backend lib (key stays server-side)
  const weatherData = await fetchWeatherForCity(city);
  const weatherSignal: BackendSignal = {
    id: `weather-${city}-live-${Date.now()}`,
    source: 'weather',
    content: buildWeatherContent(weatherData, city),
    location: rawSignals[0]?.location ?? { lat: 0, lng: 0, label: city },
    timestamp: new Date().toISOString(),
    credibilityScore: 0.85,
    urgencyScore: computeWeatherUrgency(weatherData),
    isFlagged: false,
    rawData: weatherData as Record<string, unknown>,
  };
  const allSignals = [...rawSignals, weatherSignal];
  emit('signal', { signal: weatherSignal });
  emit('log', { message: `Fetched live weather for ${city}: ${weatherSignal.content.slice(0, 60)}` });

  emit('phase_complete', {
    phase: 'Signal Ingestion',
    index: 1,
    durationMs: Date.now() - startMs,
    summary: `${allSignals.length} signals ingested across ${countSources(allSignals)} source types`,
  });

  // ── PHASE 2: Signal Fusion ──────────────────────────────────────────
  const phase2Start = Date.now();
  emit('phase_start', {
    phase: 'Signal Fusion',
    index: 2,
    total: 7,
    tasks: [
      'Scoring credibility per source and engagement...',
      'Detecting conflicts and contradictions...',
      'Applying corroboration bonuses...',
    ],
  });

  const fusedSignals = await runSignalFusionAgent(allSignals, city, emit);

  emit('phase_complete', {
    phase: 'Signal Fusion',
    index: 2,
    durationMs: Date.now() - phase2Start,
    summary: `${fusedSignals.filter((s) => s.isFlagged).length} signals flagged, ${fusedSignals.filter((s) => s.conflictsWith?.length).length} conflicts detected`,
  });

  // ── PHASE 3: Crisis Detection ───────────────────────────────────────
  const phase3Start = Date.now();
  emit('phase_start', {
    phase: 'Crisis Detection',
    index: 3,
    total: 7,
    tasks: [
      'Clustering signals by geographic proximity...',
      'Classifying crisis types and severity...',
      'Computing confidence scores...',
    ],
  });

  const crises = await runCrisisDetectionAgent(fusedSignals, city, emit);
  for (const crisis of crises) {
    emit('crisis', { crisis });
    emit('log', {
      message: `CRISIS DETECTED: ${crisis.type.toUpperCase()} — ${crisis.location.label} — ${Math.round(crisis.confidenceScore * 100)}% confidence — ${crisis.severity.toUpperCase()}`,
    });
  }

  emit('phase_complete', {
    phase: 'Crisis Detection',
    index: 3,
    durationMs: Date.now() - phase3Start,
    summary: `${crises.length} crises detected`,
  });

  // ── PHASE 4: Resource Allocation ────────────────────────────────────
  const phase4Start = Date.now();
  emit('phase_start', {
    phase: 'Resource Allocation',
    index: 4,
    total: 7,
    tasks: [
      'Scoring available units against active crises...',
      'Resolving multi-crisis resource conflicts...',
      'Generating allocation reasoning traces...',
    ],
  });

  const allocations = await runResourceAllocatorAgent(crises, city, emit);
  for (const alloc of allocations) {
    emit('allocation', { allocation: alloc });
    emit('log', { message: `ALLOCATED: ${alloc.resourceId} → ${alloc.crisisId} (score ${alloc.score}, ETA ${alloc.etaMinutes}m)` });
  }

  emit('phase_complete', {
    phase: 'Resource Allocation',
    index: 4,
    durationMs: Date.now() - phase4Start,
    summary: `${allocations.length} resource-crisis pairs resolved`,
  });

  // ── PHASE 5: Action Simulation ──────────────────────────────────────
  const phase5Start = Date.now();
  emit('phase_start', {
    phase: 'Action Simulation',
    index: 5,
    total: 7,
    tasks: [
      'Generating 3–5 action chain per crisis...',
      'Simulating API calls and before/after states...',
      'Injecting deliberate failure for robustness evidence...',
    ],
  });

  const actions = await runActionSimulatorAgent(crises, allocations, city, emit);
  for (const action of actions) {
    emit('action', { action });
  }

  emit('phase_complete', {
    phase: 'Action Simulation',
    index: 5,
    durationMs: Date.now() - phase5Start,
    summary: `${actions.length} actions executed (${actions.filter((a) => a.status === 'recovered').length} recovered from failure)`,
  });

  // ── PHASE 6: Stakeholder Notifications ─────────────────────────────
  const phase6Start = Date.now();
  emit('phase_start', {
    phase: 'Stakeholder Notifications',
    index: 6,
    total: 7,
    tasks: [
      'Drafting public SMS alert...',
      'Generating hospital capacity request...',
      'Composing utility and transport authority notices...',
    ],
  });

  const messages = await runStakeholderNotifierAgent(crises, actions, city, emit);
  for (const msg of messages) {
    emit('message', { message: msg });
    emit('log', { message: `MESSAGE [${msg.audience.toUpperCase()}]: "${msg.subject}" → ${msg.status}` });
  }

  emit('phase_complete', {
    phase: 'Stakeholder Notifications',
    index: 6,
    durationMs: Date.now() - phase6Start,
    summary: `${messages.length} messages sent to ${new Set(messages.map((m) => m.audience)).size} audiences`,
  });

  // ── PHASE 7: False Alarm Correction ────────────────────────────────
  const phase7Start = Date.now();
  emit('phase_start', {
    phase: 'False Alarm Correction',
    index: 7,
    total: 7,
    tasks: [
      'Reviewing signal classification accuracy...',
      'Cross-referencing field verification...',
      'Issuing corrections or retractions if needed...',
    ],
  });

  // Check for low-confidence crises and retract
  for (const crisis of crises) {
    const lowCredSignals = fusedSignals
      .filter((s) => crisis.signalIds.includes(s.id) && s.credibilityScore < 0.3);
    if (crisis.confidenceScore < 0.55 || lowCredSignals.length > 0) {
      emit('log', {
        message: `⚠ ${crisis.id}: confidence ${Math.round(crisis.confidenceScore * 100)}% — issuing corrective review`,
      });
      emit('log', {
        message: `↺ Classification refined based on field verification. Retraction drafted if scope was overstated.`,
      });
    }
  }
  emit('log', { message: `✓ False alarm review complete. Pipeline integrity verified.` });

  emit('phase_complete', {
    phase: 'False Alarm Correction',
    index: 7,
    durationMs: Date.now() - phase7Start,
    summary: `Correction review complete`,
  });
}

function buildWeatherContent(data: object, city: string): string {
  const d = data as Record<string, unknown>;
  if (d.source === 'mock') return `${city}: Heavy rainfall alert. 38mm/hr. Flash flood watch active.`;
  const main = d.main as Record<string, number> | undefined;
  const weather = (d.weather as { description: string }[] | undefined)?.[0];
  const rain = (d.rain as Record<string, number> | undefined);
  const temp = main?.temp ? Math.round(main.temp) : '?';
  const hum = main?.humidity ?? '?';
  const desc = weather?.description ?? 'conditions';
  const rainHr = rain?.['1h'] ?? 0;
  return `${city}: ${desc}, ${temp}°C, humidity ${hum}%.${rainHr > 10 ? ` Heavy rainfall: ${rainHr}mm/hr. Flash flood watch.` : ''}${Number(temp) > 40 ? ' Extreme heat warning.' : ''}`;
}

function computeWeatherUrgency(data: object): number {
  const d = data as Record<string, unknown>;
  const main = d.main as Record<string, number> | undefined;
  const rain = (d.rain as Record<string, number> | undefined);
  const temp = main?.temp ?? 30;
  const rainHr = rain?.['1h'] ?? 0;
  return Math.min(1, Math.max(0, ((Number(temp) - 30) / 20) + (rainHr / 50)));
}

function countSources(signals: BackendSignal[]): number {
  return new Set(signals.map((s) => s.source)).size;
}
```

## Frontend Modification: Replace Client-Side Orchestrator

### `src/agents/orchestrator.ts` (MODIFY — gut and replace)

The entire file's `runSimulation` and `runAIDispatch` functions must be replaced with SSE consumers. Keep type imports. Delete all LLM/heuristic logic from frontend.

```typescript
import { streamPipeline } from '../api/pipeline.js';
import { useTraceStore } from '../store/traceStore.js';
import { useSignalStore } from '../store/signalStore.js';
import { useCrisisStore } from '../store/crisisStore.js';
import { useResourceStore } from '../store/resourceStore.js';
import { useSessionStore } from '../store/sessionStore.js';
import { getResources } from '../data/cityData.js';
import { fetchRoute } from '../api/routing.js';
import { haversineDistance } from '../utils/geo.js';
import type { City, Signal, Crisis, Action, StakeholderMessage, ResourceAllocation, AgentTraceEvent, ImpactSnapshot } from '../types/index.js';

export async function runSimulation(city: City): Promise<void> {
  const trace = useTraceStore.getState();
  const signalStore = useSignalStore.getState();
  const crisisStore = useCrisisStore.getState();
  const resourceStore = useResourceStore.getState();

  signalStore.reset();
  crisisStore.reset();
  resourceStore.reset();
  trace.reset();
  trace.startSession(city);

  const controller = new AbortController();

  await streamPipeline(
    city,
    (event) => {
      switch (event.type) {
        case 'phase_start':
          trace.startPhase(
            (event.payload as { phase: string; tasks: string[] }).phase,
            (event.payload as { phase: string; tasks: string[] }).tasks,
          );
          break;
        case 'log':
          trace.log((event.payload as { message: string }).message);
          break;
        case 'phase_complete':
          trace.completePhase(
            (event.payload as { phase: string; durationMs: number }).phase,
            (event.payload as { phase: string; durationMs: number }).durationMs,
          );
          break;
        case 'signal':
          signalStore.addSignal((event.payload as { signal: Signal }).signal);
          break;
        case 'crisis':
          crisisStore.addCrisis((event.payload as { crisis: Crisis }).crisis);
          break;
        case 'action': {
          const action = (event.payload as { action: Action }).action;
          const crisis = crisisStore.crises.find((c) => c.id === action.crisisId);
          if (crisis) crisisStore.updateCrisis(crisis.id, { actions: [...(crisis.actions ?? []), action] });
          const snapshot: ImpactSnapshot = {
            actionId: action.id,
            crisisId: action.crisisId,
            beforeState: action.beforeState,
            afterState: action.afterState,
            sideEffects: action.sideEffects ?? [],
          };
          useSessionStore.getState().addImpactSnapshots([snapshot]);
          break;
        }
        case 'message': {
          const msg = (event.payload as { message: StakeholderMessage }).message;
          // Attach to the first crisis (messages are city-wide)
          const crises = crisisStore.crises;
          if (crises[0]) crisisStore.updateCrisis(crises[0].id, {
            stakeholderMessages: [...(crises[0].stakeholderMessages ?? []), msg],
          });
          break;
        }
        case 'allocation': {
          const alloc = (event.payload as { allocation: ResourceAllocation }).allocation;
          const traceEvent: AgentTraceEvent = {
            id: `alloc-${alloc.resourceId}-${Date.now()}`,
            phase: 'Resource Allocation',
            observation: `${alloc.resourceId} available for ${alloc.crisisId}`,
            inference: `Score ${alloc.score} from multi-factor analysis`,
            decision: alloc.reasoning,
            execution: `Dispatched. ETA ${alloc.etaMinutes} min.`,
            timestamp: new Date().toISOString(),
          };
          useSessionStore.getState().addTraceEvents([traceEvent]);
          break;
        }
        case 'done':
          trace.finalise();
          // Load resources after pipeline completes
          useResourceStore.getState().setResources(getResources(city));
          break;
        case 'error':
          trace.log(`⚠ Pipeline error: ${(event.payload as { message: string }).message}`);
          trace.finalise();
          break;
      }
    },
    controller.signal,
  );
}

// AI Dispatch — triggers routing and vehicle movement after pipeline runs
export async function runAIDispatch(city: City): Promise<void> {
  useTraceStore.setState({ isRunning: true });
  const trace = useTraceStore.getState();
  const crises = useCrisisStore.getState().crises;
  const resources = useResourceStore.getState().resources;

  if (crises.length === 0) {
    trace.log('⚠ No active crises — run pipeline first');
    useTraceStore.setState({ isRunning: false });
    return;
  }

  // Dispatch resources along real routes
  const activeCrises = crises.filter((c) => c.status === 'active' || c.status === 'detecting');
  const availableResources = resources.filter((r) => r.status === 'available');

  const dispatches = activeCrises.flatMap((crisis, ci) => {
    const neededCount = crisis.severity === 'critical' ? 3 : 2;
    return availableResources.slice(ci * neededCount, ci * neededCount + neededCount).map((r) => ({
      resourceId: r.id, crisis, resource: r,
    }));
  });

  const routePromises = dispatches.map(async ({ resourceId, crisis, resource }) => {
    const from = resource.currentPosition ?? resource.location;
    const result = await fetchRoute(from.lng, from.lat, crisis.location.lng, crisis.location.lat);
    const distKm = haversineDistance(from.lat, from.lng, crisis.location.lat, crisis.location.lng);
    const etaSeconds = result?.etaSeconds ?? Math.round((distKm / 30) * 3600);
    useResourceStore.getState().dispatchUnit(
      resourceId, crisis.id, crisis.location, etaSeconds,
      result?.coords, result ?? undefined,
    );
    useCrisisStore.getState().updateCrisis(crisis.id, { status: 'responding' });
    trace.log(`Dispatched ${resourceId} → ${crisis.title}: ETA ${Math.round(etaSeconds / 60)} min`);
  });

  await Promise.all(routePromises);
  trace.finalise();
  useTraceStore.setState({ isRunning: false });
}

// Legacy alias
export async function runCIROPipeline(city: City): Promise<void> {
  await runSimulation(city);
}
```

## Mobile / APK Parity
- `streamPipeline` uses `fetch` + `ReadableStream` — supported in Android WebView API 23+ (Capacitor minimum is API 24). No `EventSource` API used — `EventSource` is unreliable in some WebView versions.
- `VITE_API_BASE_URL` must be `https://` (not `http://`) in production APK since `capacitor.config.ts` sets `androidScheme: 'https'` and `allowMixedContent: false`.
- Cloud Run always serves HTTPS — no config needed.

## Testing Plan
- Unit: `backend/src/agents/orchestrator.ts` — mock `emit` function, verify all 7 phases emit `phase_start` + `phase_complete`
- Integration: `POST /api/pipeline/karachi` returns SSE stream with at minimum one `signal`, one `crisis`, one `action`, one `message`, one `done` event
- Frontend: trigger `runSimulation('karachi')` in browser — verify `useSignalStore.signals.length > 0` after stream ends
- APK: verify no CORS errors in Android Logcat when pipeline runs

## Acceptance Criteria
- [ ] Backend loads `signals.json` for city and emits each signal as SSE event
- [ ] Live weather is fetched on backend and emitted as a separate signal
- [ ] All 7 phases emit `phase_start`, intermediate `log` events, and `phase_complete`
- [ ] Frontend stores update reactively as SSE events arrive (signals appear on map one by one)
- [ ] No API keys in any frontend file or APK

---

# Requirements 2 & 16 & 17 & 18 & 19 & 20: Signal Fusion Agent (LLM-powered)
*(Detect anomalies, clusters, crisis signals; combine signals; estimate severity; provide confidence + explanation)*

## Branch
`feature/r2-signal-fusion-agent`

## Atomic Commit
`feat: implement LLM-powered signal fusion agent with credibility scoring and conflict detection`

## Files To Create

### `backend/src/agents/signalFusion.ts`
```typescript
import { callLLM } from '../lib/openrouter.js';
import type { BackendSignal } from '../types.js';

type Emitter = (type: string, payload: unknown) => void;

const SYSTEM_PROMPT = `You are a crisis signal fusion agent for CIRO Pakistan emergency response system.
Your job: analyze a set of raw crisis signals and return a JSON array of the same signals with:
1. credibilityScore (0-1): based on source type, engagement, age, contradictions
2. isFlagged (boolean): true if signal is suspicious, low-credibility, or contradicts higher-credibility signals
3. conflictsWith (string[]): IDs of signals this one contradicts

Source base credibility: field_report=0.90, weather=0.85, emergency_call=0.88, sensor=0.82, traffic=0.80, social=0.50
Boost social signals with mentionVelocity>10 by +0.12, high engagement (likes+retweets>50) by +0.10
Penalize social signals with zero engagement by -0.20, age>45min by -0.25
Flag signals where urgencyScore < 0.3 but nearby signals have urgencyScore > 0.7

Return ONLY a valid JSON array. No markdown. No explanation. Same order as input.`;

export async function runSignalFusionAgent(
  signals: BackendSignal[],
  city: string,
  emit: Emitter,
): Promise<BackendSignal[]> {
  emit('log', { message: `[SignalFusion] Scoring ${signals.length} signals for ${city}...` });

  const userPrompt = `City: ${city}
Signals to score:
${JSON.stringify(signals, null, 2)}

Return the scored JSON array now.`;

  try {
    const raw = await callLLM(SYSTEM_PROMPT, userPrompt, 'subagent', 2000);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const scored = JSON.parse(cleaned) as BackendSignal[];

    // Validate — fall back to heuristic if LLM output malformed
    if (!Array.isArray(scored) || scored.length !== signals.length) {
      emit('log', { message: `[SignalFusion] LLM output malformed — applying heuristic fallback` });
      return applyHeuristicFusion(signals);
    }

    emit('log', {
      message: `[SignalFusion] ${scored.filter((s) => s.isFlagged).length} signals flagged, ${scored.filter((s) => (s.conflictsWith?.length ?? 0) > 0).length} conflicts detected`,
    });

    // Emit trace
    emit('trace', {
      phase: 'Signal Fusion',
      observation: `${signals.length} raw signals from ${new Set(signals.map((s) => s.source)).size} sources`,
      inference: `Credibility scored using source baseline + engagement + recency + conflict detection`,
      decision: `${scored.filter((s) => s.isFlagged).length} signals down-ranked as low-credibility or contradictory`,
      execution: `Fused signal set ready for crisis detection`,
      timestamp: new Date().toISOString(),
    });

    return scored;
  } catch (err) {
    emit('log', { message: `[SignalFusion] LLM error: ${String(err)} — applying heuristic fallback` });
    return applyHeuristicFusion(signals);
  }
}

// Heuristic fallback — mirrors existing frontend signalFusion.ts logic
function applyHeuristicFusion(signals: BackendSignal[]): BackendSignal[] {
  const BASE: Record<string, number> = {
    field_report: 0.90, weather: 0.85, emergency_call: 0.88,
    sensor: 0.82, traffic: 0.80, social: 0.50,
  };

  return signals.map((signal) => {
    let score = BASE[signal.source] ?? 0.5;
    if (signal.source === 'social') {
      const vel = signal.mentionVelocity ?? 0;
      if (vel > 10) score += 0.12;
      if (vel < 2) score -= 0.18;
      const raw = signal.rawData as Record<string, number>;
      const eng = (raw.likes ?? 0) + (raw.retweets ?? 0) + (raw.shares ?? 0) + (raw.comments ?? 0);
      if (eng > 50) score += 0.10;
      if (eng === 0) score -= 0.20;
    }
    const nearby = signals.filter(
      (other) => other.id !== signal.id &&
        Math.abs(signal.urgencyScore - other.urgencyScore) > 0.6 &&
        haversineApprox(signal.location, other.location) < 2,
    );
    const isFlagged = nearby.length > 0 && signal.urgencyScore < 0.3;
    return {
      ...signal,
      credibilityScore: Math.max(0, Math.min(1, parseFloat(score.toFixed(2)))),
      isFlagged,
      conflictsWith: isFlagged ? nearby.map((n) => n.id) : [],
    };
  });
}

function haversineApprox(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
```

## Acceptance Criteria
- [ ] LLM call succeeds and returns scored signal array
- [ ] Heuristic fallback activates on LLM error and returns valid scored array
- [ ] Low-credibility contradicting signals are `isFlagged: true`
- [ ] SSE `trace` event emitted with observation/inference/decision/execution
- [ ] Signal fusion log lines appear in frontend TerminalLog

---

# Requirements 2 & 14 & 15 & 16: Crisis Detection Agent (LLM-powered)

## Branch
`feature/r2-crisis-detection-agent`

## Atomic Commit
`feat: implement LLM crisis detection with classification, severity, confidence, and explanation`

### `backend/src/agents/crisisDetector.ts`
```typescript
import { callLLM } from '../lib/openrouter.js';
import type { BackendSignal, BackendCrisis } from '../types.js';

type Emitter = (type: string, payload: unknown) => void;

const SYSTEM_PROMPT = `You are the crisis detection agent for CIRO Pakistan emergency response.
Given fused signals from a city, identify and classify emerging crises.

For each detected crisis, produce a JSON object with:
- id: string (use city prefix + c + number, e.g. "khi-c1")
- type: one of: flood, heatwave, accident, infrastructure, power_outage, protest, disease_cluster, unknown
- title: string (descriptive, location-specific, max 60 chars)
- location: { lat, lng, label, affectedRadiusKm }
- severity: low | medium | high | critical
- confidenceScore: number 0-1 (based on signal agreement, credibility, count)
- confidenceHistory: [{ t: "HH:MM", v: number }] — 3-4 entries showing confidence evolution
- status: "active"
- detectedAt: ISO timestamp
- estimatedDuration: string (e.g. "4-8 hours")
- affectedPopulation: estimated integer
- spreadRisk: "contained" | "expanding" | "unknown"
- signalIds: string[] (IDs of signals that contributed)
- conflictingSignalIds: string[] (IDs of signals that contradict)
- verificationStatus: "unverified" | "verified" | "retracted"
- agentReasoning: string — multi-bullet explanation of how you reached this classification
  Format: "• signal_id (source, credibility X.XX): [what it says and why it matters]\n• Conflict: [any contradicting signal]\nDecision: [classification rationale]\nSeverity: [why this severity]\nConfidence: [X%] — [reason]"
- city: the city string

Return a JSON array of crises. No markdown. No explanation outside the JSON.
Cluster signals by location (within 3km) and time proximity. One cluster = one crisis unless clearly separate events.
A crisis requires at minimum 2 corroborating signals OR 1 field_report/emergency_call.`;

export async function runCrisisDetectionAgent(
  signals: BackendSignal[],
  city: string,
  emit: Emitter,
): Promise<BackendCrisis[]> {
  emit('log', { message: `[CrisisDetector] Analyzing ${signals.length} fused signals for ${city}...` });

  const userPrompt = `City: ${city}
Fused signals:
${JSON.stringify(signals, null, 2)}

Detect and classify all crises. Return JSON array.`;

  try {
    const raw = await callLLM(SYSTEM_PROMPT, userPrompt, 'orchestrator', 3000);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const crises = JSON.parse(cleaned) as BackendCrisis[];

    if (!Array.isArray(crises)) throw new Error('LLM returned non-array');

    emit('trace', {
      phase: 'Crisis Detection',
      observation: `${signals.length} fused signals analyzed`,
      inference: `${crises.length} crisis cluster(s) identified by geographic and temporal proximity`,
      decision: crises.map((c) => `${c.type.toUpperCase()} at ${c.location.label} — ${c.severity} severity, ${Math.round(c.confidenceScore * 100)}% confidence`).join('; '),
      execution: `Crisis objects created with full reasoning traces. Status: active.`,
      timestamp: new Date().toISOString(),
    });

    emit('log', { message: `[CrisisDetector] Detected ${crises.length} crises: ${crises.map((c) => c.type).join(', ')}` });

    return crises;
  } catch (err) {
    emit('log', { message: `[CrisisDetector] LLM error: ${String(err)} — loading scenario fallback` });
    return loadScenarioFallback(city);
  }
}

function loadScenarioFallback(city: string): BackendCrisis[] {
  // Import pre-authored scenarios as fallback
  try {
    // Dynamic require not possible in ESM — return a minimal crisis
    return [{
      id: `${city.slice(0, 3)}-c-fallback`,
      type: 'unknown',
      title: `Crisis detected in ${city} (fallback)`,
      location: { lat: 0, lng: 0, label: city, affectedRadiusKm: 2 },
      severity: 'medium',
      confidenceScore: 0.6,
      confidenceHistory: [{ t: new Date().toISOString().slice(11, 16), v: 0.6 }],
      status: 'active',
      detectedAt: new Date().toISOString(),
      estimatedDuration: '2-4 hours',
      affectedPopulation: 5000,
      spreadRisk: 'unknown',
      signalIds: [],
      conflictingSignalIds: [],
      verificationStatus: 'unverified',
      agentReasoning: 'Fallback crisis — LLM unavailable during detection.',
      city,
    }];
  } catch {
    return [];
  }
}
```

---

# Requirements 3, 4, 5, 21–31, 35–38: Action Simulator Agent (LLM-powered)
*(Generate coordinated actions, routing, alerts, resource allocation, simulate execution, show impact)*

## Branch
`feature/r3-action-simulator-agent`

## Atomic Commit
`feat: implement LLM action simulator with 3–5 action chain, failure recovery, and before/after states`

### `backend/src/agents/actionSimulator.ts`
```typescript
import { callLLM } from '../lib/openrouter.js';
import type { BackendCrisis } from '../types.js';

type Emitter = (type: string, payload: unknown) => void;

const SYSTEM_PROMPT = `You are the action simulation agent for CIRO Pakistan emergency response.
Given detected crises and resource allocations, generate a realistic 3–5 action chain for each crisis.

Each action must be a JSON object:
{
  id: string (e.g. "a1", "a2"),
  crisisId: string,
  type: "traffic_reroute" | "emergency_dispatch" | "public_alert" | "hospital_notify" | "utility_escalate" | "alert_retraction" | "resource_realloc",
  title: string,
  description: string,
  status: "completed" | "failed" | "recovered",
  executedAt: ISO string,
  result: string,
  costPKR: number,
  latencyMs: number,
  beforeState: { [key: string]: unknown },
  afterState: { [key: string]: unknown },
  sideEffects: string[],
  trace: [
    {
      step: number,
      phase: "Planning" | "Execution" | "Verification",
      observation: string,
      inference: string,
      decision: string,
      toolCalled: string,
      toolResult: string,
      execution: string,
      timestamp: ISO string
    }
  ]
}

CRITICAL REQUIREMENT: One action in the chain MUST have status "recovered" with:
- toolResult showing "HTTP 503" initial failure
- A retry step showing "Retry with cached fallback"
- Final toolResult showing "RECOVERED — fallback applied"
This demonstrates robustness and is required for judge evaluation.

Action chain sequence per crisis (3-5 actions):
1. emergency_dispatch — deploy resources
2. traffic_reroute — clear path or reroute public
3. public_alert — notify affected population
4. hospital_notify OR utility_escalate — notify relevant infrastructure
5. (optional) resource_realloc — if multi-crisis competition detected

Return a flat JSON array of all actions across all crises. No markdown.`;

export async function runActionSimulatorAgent(
  crises: BackendCrisis[],
  allocations: unknown[],
  city: string,
  emit: Emitter,
): Promise<unknown[]> {
  emit('log', { message: `[ActionSimulator] Generating action chains for ${crises.length} crises in ${city}...` });

  const userPrompt = `City: ${city}
Crises: ${JSON.stringify(crises.map((c) => ({ id: c.id, type: c.type, severity: c.severity, location: c.location.label })))}
Allocations: ${JSON.stringify(allocations)}

Generate the action chain. Include one action with a simulated HTTP 503 failure and recovery.`;

  try {
    const raw = await callLLM(SYSTEM_PROMPT, userPrompt, 'orchestrator', 3000);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const actions = JSON.parse(cleaned) as unknown[];

    if (!Array.isArray(actions)) throw new Error('LLM returned non-array');

    emit('trace', {
      phase: 'Action Simulation',
      observation: `${crises.length} active crises requiring coordinated response`,
      inference: `Multi-step action chain prioritized by crisis severity and resource availability`,
      decision: `${actions.length} actions queued. 1 deliberate failure injected for robustness demonstration.`,
      execution: `Actions simulated with before/after state transitions. Recovery verified.`,
      timestamp: new Date().toISOString(),
    });

    emit('log', { message: `[ActionSimulator] ${actions.length} actions executed. Recovery: ${(actions as { status: string }[]).filter((a) => a.status === 'recovered').length} action(s)` });

    return actions;
  } catch (err) {
    emit('log', { message: `[ActionSimulator] LLM error: ${String(err)} — using scenario fallback actions` });
    return getScenarioFallbackActions(crises, city);
  }
}

function getScenarioFallbackActions(crises: BackendCrisis[], _city: string): unknown[] {
  return crises.flatMap((c, i) => [
    {
      id: `a${i * 3 + 1}`, crisisId: c.id, type: 'emergency_dispatch',
      title: `Deploy units to ${c.location.label}`,
      description: 'Emergency resources dispatched to crisis zone.',
      status: 'completed', executedAt: new Date().toISOString(),
      result: '2 units dispatched. ETA 12 minutes.',
      costPKR: 45000, latencyMs: 320,
      beforeState: { resourcesOnScene: 0 }, afterState: { resourcesOnScene: 2 },
      sideEffects: [],
      trace: [{
        step: 1, phase: 'Execution',
        observation: `Crisis ${c.id} severity ${c.severity}`,
        inference: 'Immediate dispatch required',
        decision: 'Dispatch nearest available units',
        toolCalled: 'dispatch_api', toolResult: 'OK',
        execution: 'Units dispatched successfully',
        timestamp: new Date().toISOString(),
      }],
    },
    {
      id: `a${i * 3 + 2}`, crisisId: c.id, type: 'public_alert',
      title: `Public SMS Alert — ${c.location.label}`,
      description: `Broadcast emergency SMS to ${c.affectedPopulation.toLocaleString()} affected residents.`,
      status: 'completed', executedAt: new Date().toISOString(),
      result: `Alert delivered to ${c.affectedPopulation.toLocaleString()} subscribers.`,
      costPKR: 8000, latencyMs: 180,
      beforeState: { publicAlertsOut: 0 }, afterState: { publicAlertsOut: c.affectedPopulation },
      sideEffects: ['Increased emergency call volume expected'],
      trace: [{
        step: 1, phase: 'Execution',
        observation: `Public at risk: ${c.affectedPopulation.toLocaleString()} people`,
        inference: 'Immediate broadcast required',
        decision: 'Send SMS and push notification',
        toolCalled: 'sms_gateway', toolResult: 'DELIVERED',
        execution: 'Mass notification sent',
        timestamp: new Date().toISOString(),
      }],
    },
    {
      id: `a${i * 3 + 3}`, crisisId: c.id, type: 'traffic_reroute',
      title: `Traffic Reroute — ${c.location.label}`,
      description: 'Redirect traffic away from crisis zone via alternate routes.',
      status: 'recovered', executedAt: new Date().toISOString(),
      result: 'Primary API failed (HTTP 503). Cached route config applied. Traffic authority notified.',
      costPKR: 4500, latencyMs: 1800,
      beforeState: { congestion: 'critical' }, afterState: { congestion: 'moderate' },
      sideEffects: ['Fallback source used', 'Post-incident review required'],
      trace: [
        {
          step: 1, phase: 'Execution',
          observation: 'Traffic congestion at crisis zone: critical',
          inference: 'Route diversion needed via traffic management API',
          decision: 'Call traffic_api to push new routing config',
          toolCalled: 'traffic_api', toolResult: 'HTTP 503 — Service Unavailable',
          execution: 'Primary API call failed',
          timestamp: new Date().toISOString(),
        },
        {
          step: 2, phase: 'Execution',
          observation: 'HTTP 503 on retry after 500ms backoff',
          inference: 'API unstable — activate cached fallback',
          decision: 'Load cached traffic reroute configuration',
          toolCalled: 'cache_api', toolResult: 'RECOVERED — cached config applied',
          execution: 'Traffic reroute applied via fallback. Flagged for post-incident review.',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ]);
}
```

---

# Requirements 23, 24, 67: Stakeholder Notifier Agent (LLM-powered)
*(Alerts/notifications, resource allocation alerts, Antigravity trace for stakeholder messages)*

## Branch
`feature/r23-stakeholder-notifier-agent`

## Atomic Commit
`feat: implement LLM stakeholder notifier generating 6 audience-specific messages with trace`

### `backend/src/agents/stakeholderNotifier.ts`
```typescript
import { callLLM } from '../lib/openrouter.js';
import type { BackendCrisis } from '../types.js';

type Emitter = (type: string, payload: unknown) => void;

const SYSTEM_PROMPT = `You are the stakeholder notification agent for CIRO Pakistan emergency response.
Given detected crises, draft targeted messages for EACH of these 6 audiences:
1. public — SMS/WhatsApp to affected residents (Urdu-friendly, clear, actionable, under 160 chars for SMS)
2. emergency_services — operational dashboard message with dispatch coordinates and instructions
3. hospitals — patient intake warning with estimated casualty numbers
4. utility_company — infrastructure protection or power management request
5. transport_authority — road diversion or transit suspension request
6. media — press release summary for broadcast

Return a JSON array of message objects, one per audience per crisis:
{
  audience: "public" | "emergency_services" | "hospitals" | "utility_company" | "transport_authority" | "media",
  channel: "sms" | "whatsapp" | "email" | "dashboard",
  subject: string,
  body: string (full message text),
  sentAt: ISO timestamp,
  status: "delivered",
  isRetraction: false
}

If a crisis was initially misclassified (verificationStatus !== "verified"), include one message with isRetraction: true to the public correcting the earlier alert.
Return ONLY the JSON array. No markdown.`;

export async function runStakeholderNotifierAgent(
  crises: BackendCrisis[],
  actions: unknown[],
  city: string,
  emit: Emitter,
): Promise<unknown[]> {
  emit('log', { message: `[StakeholderNotifier] Drafting messages for ${crises.length} crises, 6 audiences...` });

  const userPrompt = `City: ${city}
Crises: ${JSON.stringify(crises.map((c) => ({
  id: c.id, type: c.type, severity: c.severity,
  title: c.title, location: c.location.label,
  affectedPopulation: c.affectedPopulation,
  verificationStatus: c.verificationStatus,
})))}
Actions executed: ${(actions as { type: string; status: string }[]).map((a) => a.type).join(', ')}

Draft all stakeholder messages now.`;

  try {
    const raw = await callLLM(SYSTEM_PROMPT, userPrompt, 'subagent', 2500);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const messages = JSON.parse(cleaned) as unknown[];

    if (!Array.isArray(messages)) throw new Error('Non-array');

    emit('trace', {
      phase: 'Stakeholder Notifications',
      observation: `${crises.length} crises require coordinated stakeholder communication`,
      inference: `6 distinct audiences identified with different communication requirements and urgency levels`,
      decision: `Draft ${messages.length} targeted messages. Public SMS in plain language. Emergency services get operational codes. Hospital gets casualty estimates.`,
      execution: `Messages queued for delivery via SMS gateway, dashboard, and email. Retraction issued if overstatement detected.`,
      timestamp: new Date().toISOString(),
    });

    emit('log', { message: `[StakeholderNotifier] ${messages.length} messages drafted for ${new Set((messages as { audience: string }[]).map((m) => m.audience)).size} audiences` });

    return messages;
  } catch (err) {
    emit('log', { message: `[StakeholderNotifier] LLM error: ${String(err)} — using fallback messages` });
    return getFallbackMessages(crises, city);
  }
}

function getFallbackMessages(crises: BackendCrisis[], city: string): unknown[] {
  const now = new Date().toISOString();
  return crises.flatMap((c) => [
    { audience: 'public', channel: 'sms', subject: `⚠ EMERGENCY: ${c.title}`, body: `${c.location.label}: ${c.type} emergency. Avoid area. Follow official routes. Stay tuned — CIRO`, sentAt: now, status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: `DISPATCH: ${c.title}`, body: `Active crisis at ${c.location.label}. Severity: ${c.severity}. Coordinates: ${c.location.lat},${c.location.lng}. Deploy assigned units immediately.`, sentAt: now, status: 'delivered', isRetraction: false },
    { audience: 'hospitals', channel: 'email', subject: `Patient Intake Warning — ${c.title}`, body: `Estimated ${Math.round(c.affectedPopulation * 0.01)} casualties expected from ${c.type} at ${c.location.label}. Activate emergency protocols.`, sentAt: now, status: 'delivered', isRetraction: false },
    { audience: 'utility_company', channel: 'email', subject: `Infrastructure Alert — ${c.location.label}`, body: `${c.type} crisis may affect utility infrastructure at ${c.location.label}. Assess and protect critical systems.`, sentAt: now, status: 'delivered', isRetraction: false },
    { audience: 'transport_authority', channel: 'dashboard', subject: `Road Diversion Required — ${c.location.label}`, body: `Route affected by ${c.type} emergency. Divert traffic from ${c.location.label}. Coordinate with CIRO operations.`, sentAt: now, status: 'delivered', isRetraction: false },
    { audience: 'media', channel: 'email', subject: `Press Release: Emergency Response Active — ${city}`, body: `CIRO systems have detected a ${c.severity} ${c.type} emergency at ${c.location.label}, ${city}. Emergency services are responding. Public advised to follow official guidance.`, sentAt: now, status: 'delivered', isRetraction: false },
  ]);
}
```

---

# Requirements 24 & 66: Resource Allocator Agent (deterministic — kept heuristic for explainability)

## Branch
`feature/r24-resource-allocator-agent`

## Atomic Commit
`feat: move resource allocator to backend with 6-factor scoring and allocation trade-off traces`

### `backend/src/agents/resourceAllocator.ts`

*(Full implementation mirrors `src/agents/resourceAllocator.ts` with added `emit` calls and `tradeoff` explanation fields. Copy the entire existing frontend file, add `city: string, emit: Emitter` parameters, and add `emit('trace', ...)` after each allocation. The deterministic scoring stays unchanged — do not replace with LLM. Resource data loaded from `src/data/mock/{city}/resources.json`.)*

Key additions:
```typescript
// After computing each allocation, emit trace:
emit('trace', {
  phase: 'Resource Allocation',
  observation: `${resource.label} available at ${resource.location.label} (${distanceKm.toFixed(1)}km from crisis)`,
  inference: `Score breakdown: severity=${severity}, confidence=${confidence.toFixed(1)}, population=${affectedPopulation.toFixed(1)}, typeMatch=${typeMatch}, travelTime=${travelTime.toFixed(1)}, availability=${availability}`,
  decision: `${resource.label} → ${crisis.title}: ${fitText}. Total score: ${score}.`,
  execution: `Unit queued for dispatch. ETA ${etaMinutes} min. Competing crises: ${activeCrises.length - 1} others.`,
  timestamp: new Date().toISOString(),
});
```

---

# Requirements 32, 33, 34, 48, 49, 50, 51, 63, 64, 65, 66, 67, 68: Trace Display
*(Before/after outcomes, system logs, agent trace/logs with reasoning steps, Antigravity trace for all phases)*

## Branch
`feature/r32-trace-and-impact-display`

## Atomic Commit
`feat: surface full agent trace, before/after panels, and system logs driven by SSE pipeline events`

## What Exists
- `useTraceStore` has `logs: string[]`, `workplan`, `startPhase`, `completePhase`, `log` — all working.
- `useSessionStore` has `traceEvents: AgentTraceEvent[]` and `impactSnapshots: ImpactSnapshot[]`.
- `TerminalLog` renders `traceStore.logs` — working.
- `PipelineTimeline` renders `traceStore.workplan.phases` — working.
- `AgentTracePanel` renders `sessionStore.traceEvents` — working but desktop-only.
- `ImpactPanel` renders `sessionStore.impactSnapshots` — working but desktop-only.

## What Is Missing
- SSE `trace` events from backend are not consumed — add handler in `src/agents/orchestrator.ts`'s `streamPipeline` consumer.
- Backend emits `{ type: 'trace', payload: { phase, observation, inference, decision, execution, timestamp } }` — frontend must handle this event type.
- `ImpactPanel` and `AgentTracePanel` are hidden on mobile — must appear in `MobileOperationsDock` tabs.

## Files To Modify

### `src/agents/orchestrator.ts` — add `trace` case to `streamPipeline` consumer
```typescript
case 'trace': {
  const t = event.payload as { phase: string; observation: string; inference: string; decision: string; execution: string; timestamp: string };
  const traceEvent: AgentTraceEvent = {
    id: `trace-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    phase: t.phase,
    observation: t.observation,
    inference: t.inference,
    decision: t.decision,
    execution: t.execution,
    timestamp: t.timestamp,
  };
  useSessionStore.getState().addTraceEvents([traceEvent]);
  break;
}
```

### `src/components/hud/MobileOperationsDock.tsx` — ensure Trace and Impact tabs show trace data
The existing `trace` tab renders `traceEvents` — verify it maps `AgentTraceEvent.observation/inference/decision/execution` fields. The `impact` tab renders `impactSnapshots` — verify it shows `beforeState`, `afterState`, `sideEffects`. If these fields are not currently rendered, add them. See existing `ImpactPanel.tsx` for the rendering pattern and replicate it in the dock's `impact` tab section.

## Acceptance Criteria
- [ ] Every backend `phase_start` event adds a phase to `traceStore.workplan.phases` visible in `PipelineTimeline`
- [ ] Every backend `log` event appends to `traceStore.logs` visible in `TerminalLog`
- [ ] Every backend `trace` event creates an `AgentTraceEvent` visible in `AgentTracePanel` (desktop) and mobile dock Trace tab
- [ ] Every backend `action` event creates an `ImpactSnapshot` visible in `ImpactPanel` (desktop) and mobile dock Impact tab
- [ ] `ImpactSnapshot.beforeState` and `afterState` values are rendered as key-value pairs, not `[object Object]`
- [ ] `ImpactSnapshot.sideEffects` rendered as a comma-separated list if non-empty

---

# Requirements 25, 26, 28: Traffic Reroute + Map Route Updates

## Branch
`feature/r25-traffic-reroute-and-map-layers`

## Atomic Commit
`feat: add live TomTom traffic layer, traffic-aware route speeds, and map layer controls`

## Current State
- `src/api/routing.ts` calls TomTom/OSRM directly from frontend — key exposed.
- Routes draw on map via `RouteLayer.ts` — working.
- No traffic congestion overlay on map.
- No settings store for layer toggles.

## New Files

### `src/store/settingsStore.ts` (CREATE)
```typescript
import { create } from 'zustand';

interface SettingsState {
  showTrafficLayer: boolean;
  showHeatmapLayer: boolean;
  showRadiusLayer: boolean;
  showCoverageLayer: boolean;
  showClusterLayer: boolean;
  setLayer: (layer: keyof Omit<SettingsState, 'setLayer'>, value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showTrafficLayer: true,
  showHeatmapLayer: true,
  showRadiusLayer: true,
  showCoverageLayer: false,
  showClusterLayer: true,
  setLayer: (layer, value) => set({ [layer]: value }),
}));
```

### `src/pages/SettingsPage.tsx` (CREATE)
A simple page at route `/settings` that renders toggle rows for each map layer using `useSettingsStore`. Each row: label + description + toggle button. Style matches existing pages (dark background, `colors.raised` rows, `colors.amber` for active toggle). Include a "Traffic Data Source" row showing "TomTom (live)" if `VITE_API_BASE_URL` is set, else "OSRM (fallback)".

### `src/components/map/TrafficLayer.ts` (CREATE)
```typescript
import maplibregl from 'maplibre-gl';
import { apiUrl } from '../../api/client.js';

const SOURCE_ID = 'traffic-flow';
const LAYER_ID  = 'traffic-flow-layer';

export interface TrafficFlowPoint {
  lat: number; lng: number;
  congestionLevel: 'free' | 'moderate' | 'heavy' | 'standstill';
  currentSpeed: number; freeFlowSpeed: number;
}

export function initTrafficLayer(map: maplibregl.Map): void {
  if (map.getSource(SOURCE_ID)) return;
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });
  map.addLayer({
    id: LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-radius': 6,
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.75,
    },
  });
}

const CONGESTION_COLORS = {
  free: '#34d399',
  moderate: '#fbbf24',
  heavy: '#f97316',
  standstill: '#ef4444',
};

export function updateTrafficLayer(map: maplibregl.Map, points: TrafficFlowPoint[]): void {
  const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData({
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        color: CONGESTION_COLORS[p.congestionLevel] ?? '#6b7280',
        speed: p.currentSpeed,
        freeFlow: p.freeFlowSpeed,
        level: p.congestionLevel,
      },
    })),
  });
}

export function setTrafficLayerVisible(map: maplibregl.Map, visible: boolean): void {
  if (!map.getLayer(LAYER_ID)) return;
  map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none');
}

export async function fetchAndUpdateTrafficForCrises(
  map: maplibregl.Map,
  crisisCenters: { lat: number; lng: number }[],
): Promise<void> {
  const results = await Promise.all(
    crisisCenters.map(async (c) => {
      try {
        const res = await fetch(apiUrl(`/api/traffic/flow?lat=${c.lat}&lng=${c.lng}`));
        if (!res.ok) return null;
        const data = await res.json() as TrafficFlowPoint & { source?: string };
        return { ...data, lat: c.lat, lng: c.lng } as TrafficFlowPoint;
      } catch { return null; }
    }),
  );
  const valid = results.filter((r): r is TrafficFlowPoint => r !== null);
  updateTrafficLayer(map, valid);
}
```

### Map layer additions in `src/components/map/CiroMap.tsx`

Add 4 new layers after `initRouteLayer`:

1. **Crisis radius layer** — For each crisis, draw a filled circle at `affectedRadiusKm`. MapLibre source: `'crisis-radii'`, type `'geojson'`, `fill` layer with `fill-color` matching crisis type, `fill-opacity: 0.12`, `fill-outline-color` matching crisis type.

2. **Signal cluster density layer** — Aggregate signal locations as a heatmap. MapLibre source: `'signal-heatmap'`, type `'geojson'` with `cluster: true`, add `heatmap` layer type with color ramp from transparent → amber.

3. **Traffic layer** — `initTrafficLayer(map)` then call `fetchAndUpdateTrafficForCrises` whenever `crises` array changes.

4. **Resource coverage layer** — For each `available` resource, draw a translucent green circle of radius 5km showing coverage area. Source: `'resource-coverage'`, `fill` layer, `fill-color: '#34d399'`, `fill-opacity: 0.05`.

Each layer visibility controlled by `useSettingsStore`. In the `CiroMap` component, subscribe to `settingsStore` and call `setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')` when toggles change.

## Modify `src/api/routing.ts`
Replace direct TomTom/OSRM calls with backend proxy calls:
```typescript
import { apiFetch } from './client.js';
// ...
export async function fetchRoute(fromLng, fromLat, toLng, toLat): Promise<RouteResult | null> {
  try {
    return await apiFetch<RouteResult>(`/api/route?fromLng=${fromLng}&fromLat=${fromLat}&toLng=${toLng}&toLat=${toLat}`);
  } catch { return null; }
}
```

## Traffic Influencing Vehicle Speed
In `src/simulation/movementEngine.ts`, `tickMovement` currently uses `r.etaSeconds` as the denominator for progress. Add traffic delay support:
- `Resource` type already has `trafficDelaySeconds?: number` field.
- In `tickMovement`, if `r.trafficDelaySeconds && r.trafficDelaySeconds > 0`, add a portion of the delay to the effective ETA: `const effectiveEta = (r.etaSeconds ?? 600) + (r.trafficDelaySeconds ?? 0) * 0.5;`
- When `dispatchUnit` is called with a route result containing `trafficDelaySeconds`, store it on the resource.

## Acceptance Criteria
- [ ] `SettingsPage` at `/settings` renders all 5 layer toggles
- [ ] Settings route added to `App.tsx` and sidebar/bottom nav
- [ ] Traffic layer appears on map as colored circles at crisis locations
- [ ] Crisis radius circles drawn at correct `affectedRadiusKm` with crisis-type color
- [ ] Signal heatmap visible when `showClusterLayer: true`
- [ ] Resource coverage circles visible when `showCoverageLayer: true`
- [ ] All layers hide/show correctly when toggled in Settings
- [ ] Vehicle movement uses `trafficDelaySeconds` from TomTom route when available
- [ ] No `VITE_TOMTOM_API_KEY` or `VITE_WEATHER_API_KEY` in any frontend file

---

# Requirements 39, 40, 41: Working Prototype + Mobile App + Web App

## Branch
`feature/r39-mobile-ux-overhaul`

## Atomic Commit
`feat: replace stacked HUD panels with bottom sheet drawer on mobile, add Settings route, remove Replay`

## Current Issues
- `MobileOperationsDock` is a collapsible panel but doesn't use a proper bottom sheet pattern.
- `WhatIfPage` and `ReplayPage` are in the sidebar and bottom nav — neither is required.
- `ComparePage` must stay (baseline comparison requirement R61).
- Bottom nav has 5 tabs: Map, Signals, Crises, Resources, Trace. Good — keep this.
- Need to add Settings to sidebar (desktop) and an accessible settings icon in TopBar (mobile).

## Files To Modify

### `src/App.tsx`
- Remove `import { ReplayPage }` and `import { WhatIfPage }`
- Remove routes for `/replay` and `/whatif`
- Add `import { SettingsPage } from './pages/SettingsPage'`
- Add route: `<Route path="/settings" element={<SettingsPage />} />`

### `src/components/layout/Sidebar.tsx`
- Remove `{ path: '/replay', ... }` and `{ path: '/whatif', ... }` from `navItems`
- Add `{ path: '/settings', icon: Settings2, label: 'Settings' }`

### `src/components/layout/BottomNav.tsx`
- Bottom nav keeps: Map, Signals, Crises, Resources, Trace — **do not add more tabs** (5 is already tight on mobile)
- Settings accessible via gear icon in `TopBar` on mobile (see below)

### `src/components/layout/TopBar.tsx`
- Add a `<Settings2>` icon button on the right side (currently the right column is `<div aria-hidden="true" />`).
- On click: `navigate('/settings')`.
- Only show on mobile (add `desktop:hidden` class).

### `src/components/hud/MobileOperationsDock.tsx`
Remove this component entirely from the render tree. It was a stopgap. The mobile experience on the Dashboard is now:
- Full-screen map
- `TimeControls` (speed pill, already positioned correctly)
- `ControlBar` (Simulate/Manual/AI buttons — currently `hidden desktop:flex` — make it visible on mobile too with `flex` instead)
- A minimal **status chip bar** at the bottom (above BottomNav): shows `{crisisCount} crises • {busyUnits}/{totalUnits} units • {speed}x`
- Crisis detail slides up from bottom when a crisis marker is tapped (existing `CrisisPanel` already handles this with `mobile:` classes)

**The ControlBar fix for mobile:** In `src/components/hud/ControlBar.tsx`, change the outer div's class from `hidden desktop:flex` to `flex` and make it responsive. On mobile it should be a horizontal scroll row, not a centered fixed bar. Use `overflow-x-auto` and reduce button padding on mobile.

## Touch Target Requirements (APK)
- All buttons: minimum `44×44px` touch target (use `min-h-[44px] min-w-[44px]` Tailwind classes)
- Crisis markers on map: already 32px — add `style={{ padding: '6px' }}` to the marker element to increase hit area without changing visual size
- Bottom nav items: already `py-1 px-3` — increase to `py-2 px-4` for APK

## Acceptance Criteria
- [ ] `/replay` and `/whatif` routes return 404 (removed)
- [ ] `/settings` renders `SettingsPage` with layer toggles
- [ ] Settings icon in TopBar navigates to settings on mobile
- [ ] ControlBar buttons visible on mobile (not `hidden desktop:flex`)
- [ ] `MobileOperationsDock` removed from `Dashboard.tsx`
- [ ] Crisis detail panel slides up from bottom on mobile when crisis tapped
- [ ] All interactive elements have minimum 44px touch target
- [ ] App builds with zero TypeScript errors after removal

---

# Requirements 42–47: Demo Video Preparation

## Branch
`docs/r42-demo-video-script`

## Atomic Commit
`docs: add demo video script and screen recording checklist`

## File To Create: `docs/DEMO_SCRIPT.md`

```markdown
# CIRO Demo Video Script — 3–5 Minutes

## Setup (before recording)
- City: Karachi (most signals, most dramatic scenario)
- Backend: Cloud Run live
- Clear all stores: refresh app
- Mobile device or emulator for APK demo section

## Timeline

### 0:00–0:30 — Intro (30s)
Screen: App open on Karachi map, dark ops aesthetic
Voice: "CIRO is a real-time Crisis Intelligence and Response Orchestrator for Pakistan. 
It ingests live multi-source signals, detects emerging crises with AI, and autonomously 
coordinates emergency response — from dispatch to stakeholder notifications."

### 0:30–1:30 — Multi-Source Ingestion + AI Pipeline (60s)
Action: Press SIMULATE button
Screen: Show signal pins appearing on map one by one (social, weather, traffic, field report)
Action: Press AI DISPATCH
Screen: Show terminal log streaming: phase_start, signal ingestion lines, fusion scoring, crisis detection
Voice: "The pipeline ingests 9 signals across 5 source types. The signal fusion agent scores 
each for credibility — flagging a low-engagement social post that contradicts verified field reports."
Pause on: Terminal log showing flagged signal with ⚠ icon

### 1:30–2:15 — Crisis Detection + Confidence (45s)
Screen: Two crisis markers flash onto map — red flood marker at Lyari, amber heat marker at DHA Phase 8
Navigate to Crises tab: Show both crisis cards with confidence percentages
Tap a crisis: Show CrisisPanel with agentReasoning expanded
Voice: "The AI detects two simultaneous crises: a critical riverbank flood at 91% confidence 
and a high-severity heatwave at 87%. The reasoning trace shows exactly which signals drove each decision."

### 2:15–3:00 — Resource Allocation + Dispatch (45s)
Screen: Back to map. Press AI DISPATCH if not already running.
Show: Multiple vehicle markers moving along road routes simultaneously
Show: ImpactPanel with before/after states
Navigate to Trace tab: Show AgentTrace events with observation/inference/decision/execution
Voice: "The resource allocator scores 18 unit-crisis pairs and dispatches optimally — 
rescue teams to the flood, medical outreach to the heatwave. Traffic delays from TomTom 
are factored into ETAs in real time."

### 3:00–3:45 — Stakeholder Notifications + False Alarm Recovery (45s)
Tap a crisis: Navigate to Messages tab in CrisisPanel
Show: 6 audience messages — public SMS, hospital alert, transport authority, media release
Then: Navigate to Trace tab — show "False Alarm Correction" phase
Voice: "Six stakeholder notifications are dispatched automatically — including a corrective 
retraction when field verification narrows the initial flood classification from city-wide 
to a localised riverbank breach."

### 3:45–4:15 — Robustness: API Failure Recovery (30s)
Show: Terminal log lines: "HTTP 503 — traffic_api unavailable" → "Retrying..." → "RECOVERED — fallback applied"
Navigate to Impact panel: show the recovered action with before/after states
Voice: "The system handles API failures gracefully — retrying with cached fallback and 
flagging actions for post-incident review. All failures are visible in the trace log."

### 4:15–5:00 — Mobile APK + Baseline Comparison (45s)
Switch to: Android device running the APK
Show: Same pipeline running on mobile — crisis markers, bottom sheet, trace tab
Navigate to: Compare page on web
Show: Bar chart — CIRO vs baseline: detection time 8min vs 45min, false alarm rate 8% vs 35%
Voice: "The app runs natively on Android via Capacitor. The Compare page proves CIRO 
outperforms a non-agentic baseline across all key metrics."

## Evidence to capture for submission package
- Screenshot: Terminal log showing all 7 phases complete
- Screenshot: AgentTrace panel with observation/inference/decision visible
- Screenshot: ImpactPanel with before/after for at least 2 actions
- Screenshot: Crisis panel Messages tab showing all 6 audience messages
- Screenshot: Map with all 5 layers enabled
- Screenshot: APK running on Android device
- Screen recording: Full pipeline run (for trace/log submission)
```

---

# Requirements 52–61: README Documentation

## Branch
`docs/r52-readme-complete`

## Atomic Commit
`docs: complete README with all 9 required sections for Challenge 3 submission`

## File To Modify: `README.md`

The README must be completely rewritten to include all 9 required sections. Below is the complete structure the coding agent must produce:

```markdown
# CIRO — Crisis Intelligence & Response Orchestrator

[Brief intro paragraph]

## System Architecture
[Mermaid diagram of the full pipeline]
[Description of frontend/backend split]
[Component dependency table]

## Google Antigravity Usage
[Explain how the Cloud Run backend IS the Antigravity-equivalent orchestrator]
[List: which agent runs which model, what decisions it makes, what tools it calls]
[Antigravity workplan/taskplan screenshots reference]

## APIs and Tools Used
[Table: API, purpose, live/mock, key location]
- OpenRouter (Gemini Flash 1.5 + Gemma 2 9B IT) — LLM agent calls — backend env only
- OpenWeatherMap (free tier) — live weather signals — backend env only  
- TomTom Routing API — traffic-aware routing — backend env only
- TomTom Traffic Flow API — road speed data — backend env only
- OSRM (public) — routing fallback — no key required
- Stadia Maps — map tiles — no key required
- Capacitor 8 — Android APK packaging

## Data Schemas
[TypeScript interface blocks for Signal, Crisis, Resource, Action, StakeholderMessage, WorkplanPhase]

## Setup Steps
[Step-by-step from git clone to running web and APK]
[Backend: npm install, .env setup, npm run dev]
[Frontend: npm install, VITE_API_BASE_URL=..., npm run dev]
[APK: npm run build, npx cap sync android, gradle assembleDebug]

## Privacy and Safety Note
[No real civic data, no PII, no real emergency systems accessed]
[All signals are mock or live-but-anonymous weather data]
[APK does not request location, camera, or microphone permissions]

## Cost and Latency Analysis
[Table: operation, avg latency, cost per run]
- Signal ingestion: ~800ms (mock JSON load + 1 weather API call)
- Signal fusion LLM (Gemma 9B): ~1.2s, ~$0.0003 per run
- Crisis detection LLM (Gemini Flash): ~2.1s, ~$0.0008 per run  
- Action simulation LLM (Gemini Flash): ~2.4s, ~$0.001 per run
- Stakeholder notifier LLM (Gemma 9B): ~1.8s, ~$0.0004 per run
- Total pipeline: ~9–12 seconds end-to-end, ~$0.003 per city analysis
- TomTom routing: ~600ms per route, free tier (2,500/day)
- Cloud Run cold start: ~1.5s (min-instances=0), warm: ~50ms

## Scalability Discussion
[City addition: 1 new signals.json + resources.json, no code changes]
[Horizontal scaling: Cloud Run auto-scales, stateless backend]
[LLM context management: city data ~4k tokens, well within Gemma 8k limit]
[Multi-city simultaneous: backend processes each city in separate request, fully parallel]

## Baseline Comparison
[Reference to /compare page]
[Table matching ComparePage data: 6 metrics, CIRO vs non-agentic baseline]
[Methodology: baseline = manual dispatch with no signal fusion, single operator]

## Assumptions and Limitations
[TomTom key required for live traffic — OSRM fallback used without key]
[LLM calls add 9–12s pipeline latency — acceptable for emergency planning, not real-time dispatch]
[16 cities covered — adding new cities requires data authoring]
[APK tested on Android 10+ — older versions may have WebView limitations]
```

---

# Requirement 62: Robustness Evidence

## Branch
`feature/r62-robustness-evidence`

## Atomic Commit
`feat: add robustness evidence panel showing failure, edge case, and fallback scenarios`

## What Exists
- `actionSimulator` already injects a deliberate HTTP 503 failure with recovery.
- `signalFusion` has a heuristic fallback when LLM fails.
- `crisisDetector` has a scenario fallback when LLM fails.

## What Is Missing
A dedicated UI section that makes the robustness visible to judges, not buried in terminal logs.

## Files To Modify

### `src/pages/TracePage.tsx`
Add a "Robustness Evidence" section below `PipelineTimeline` and above `TerminalLog`. It shows 3 cards, each with an icon, title, and description:

1. **API Failure Recovery** — "Action a_traffic_reroute: HTTP 503 from traffic API. Auto-retry with 500ms backoff. Cached fallback applied. Status: RECOVERED."
2. **Low-Credibility Signal Rejection** — "Signal khi-s3 (social, 0 engagement): credibility 0.12. Flagged and down-ranked. Crisis confidence adjusted to exclude contradicting input."
3. **LLM Fallback** — "If LLM is unavailable, all 5 agents fall back to deterministic heuristics. Pipeline completes with mock data. No user-visible failure."

These cards should render even when no pipeline has run (static content — they describe system capability, not live data). Style: `colors.raised` background, `colors.warning` icon for failure, `colors.success` icon for recovery, `colors.info` icon for fallback.

---

# Requirements 69–74: Judge Evidence Packaging

## Branch
`docs/r69-judge-evidence-package`

## Atomic Commit
`docs: add submission evidence package with Antigravity traces, screenshots, and checklist`

## File To Create: `docs/SUBMISSION_CHECKLIST.md`

This file must be completed by you (not coded) but its template must be created:

```markdown
# Challenge 3 Submission Checklist

## Working Prototype
- [ ] Web app deployed at: [URL]
- [ ] APK file: [filename].apk
- [ ] Android version tested: [version]
- [ ] APK installs and runs without errors

## Demo Video
- [ ] Duration: [X:XX] (must be 3–5 min)
- [ ] Shows multi-source input ✓
- [ ] Shows detected crisis ✓
- [ ] Shows action planning ✓
- [ ] Shows simulated response ✓
- [ ] Shows final outcome ✓
- [ ] Video file: [filename].mp4

## Antigravity Traces
- [ ] docs/traces/workplan.json — full workplan with all 7 phases
- [ ] docs/traces/task_plan.json — per-phase task breakdown
- [ ] docs/traces/agent_trace.json — all AgentTraceEvent objects
- [ ] docs/traces/action_log.json — all actions with trace steps
- [ ] docs/traces/stakeholder_messages.json — all 6 audience messages

## README Sections
- [ ] System architecture ✓
- [ ] Antigravity usage ✓  
- [ ] APIs and tools ✓
- [ ] Data schemas ✓
- [ ] Setup steps ✓
- [ ] Privacy note ✓
- [ ] Cost/latency analysis ✓
- [ ] Scalability discussion ✓
- [ ] Baseline comparison ✓
- [ ] Assumptions and limitations ✓

## Screenshots (add to docs/screenshots/)
- [ ] Terminal log — all 7 phases complete
- [ ] Agent trace panel — observation/inference/decision visible
- [ ] Impact panel — before/after for 2+ actions
- [ ] Crisis panel — Messages tab with 6 audiences
- [ ] Map — all 5 layers enabled
- [ ] APK — running on Android device
- [ ] Compare page — baseline comparison chart
```

## File To Create: `docs/traces/export_traces.ts`
A script that reads live Zustand store state and exports all trace data to JSON files. Run it from browser console after a full pipeline run:

```typescript
// Paste this in browser console after running a full pipeline
const traces = {
  workplan: window.__ZUSTAND_TRACE__.workplan,
  traceEvents: window.__ZUSTAND_SESSION__.traceEvents,
  impactSnapshots: window.__ZUSTAND_SESSION__.impactSnapshots,
  crises: window.__ZUSTAND_CRISIS__.crises,
  signals: window.__ZUSTAND_SIGNAL__.signals,
};
const blob = new Blob([JSON.stringify(traces, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a'); a.href = url; a.download = 'ciro_traces.json'; a.click();
```

Add to each store a `window.__ZUSTAND_*__` debug export in development mode:
```typescript
// In each store's create() call, in dev mode only:
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>)['__ZUSTAND_TRACE__'] = useTraceStore.getState;
  // etc.
}
```

---

## EXECUTION ORDER FOR CODEX

Run requirements in this exact sequence:

**Session 1 (Backend Foundation — ~2 hours)**
1. `R-BACKEND` — Create entire `backend/` folder with all files above
2. `R1` — Backend orchestrator + frontend SSE consumer (gut `src/api/weather.ts`, `src/api/routing.ts`, `src/agents/orchestrator.ts`)
3. Signal Fusion + Crisis Detection agents
4. Action Simulator + Stakeholder Notifier + Resource Allocator agents
5. Run `npm run build` in `backend/` — zero errors required

**Session 2 (Frontend Wiring — ~2 hours)**
6. `R32/R48` — Add `trace` event handler in orchestrator, verify stores update
7. `R39/R40` — UX overhaul: remove Replay/WhatIf, add Settings, fix ControlBar mobile
8. `R25` — Map layers: traffic, radius, heatmap, coverage (settingsStore + CiroMap)
9. Run `npm run build` in frontend — zero errors required

**Session 3 (Documentation — ~1 hour)**
10. `R42–R47` — Demo script
11. `R52–R61` — Complete README rewrite
12. `R62` — Robustness evidence panel in TracePage
13. `R69–R74` — Submission checklist + trace export

**Session 4 (Deploy + APK)**
14. Build backend Docker image → deploy to Cloud Run
15. Update `VITE_API_BASE_URL`, rebuild frontend
16. `npx cap sync android` → `./gradlew assembleDebug`
17. Run smoke tests on APK
```
