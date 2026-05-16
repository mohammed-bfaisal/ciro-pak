# CIRO — Implementation Workplan v2
**session_id:** ciro-workplan-v2-20260516  
**source:** MODEL  
**type:** WORKPLAN  
**status:** PENDING  
**created_at:** 2026-05-16T16:30:00Z  
**ref_spec:** SPEC_v2.md

---

## WORKPLAN OVERVIEW

**Total phases:** 4  
**Total tasks:** 22  
**Estimated crises detected (new cities):** 28 crises across 14 cities  
**Estimated signals authored:** 112+ (8 per city × 14 cities)  

---

## PHASE 1 — Type System & Routing Foundation

**status:** PENDING  
**depends_on:** nothing  
**blocks:** all other phases

### OBSERVATION
`City` type is a 2-member union. `orchestrator.ts` uses a binary `if/else` to load city data. `TopBar.tsx` has 2 hardcoded `<option>` elements. If we add cities without fixing the type first, TypeScript will throw on every subsequent task.

### REASONING
Type system must be the first thing touched — it gates everything downstream. A dynamic import map in the orchestrator replaces fragile if/else branching and scales to 16 cities without code changes.

### DECISION
Update types first. Then build the data loader. Then add cities. Never the reverse.

---

### TASK 1.1 — Expand `City` type
**file:** `src/types/index.ts`  
**action:** Replace 2-member union with 16-member union  
```
City = 'karachi' | 'islamabad' | 'lahore' | 'rawalpindi' | 'faisalabad'
     | 'multan' | 'gujranwala' | 'sialkot' | 'bahawalpur' | 'sargodha'
     | 'peshawar' | 'abbottabad' | 'quetta' | 'gwadar' | 'hyderabad' | 'sukkur'
```

### TASK 1.2 — Build city metadata registry
**file:** `src/data/cities.ts` (new)  
**action:** Create a `CITY_REGISTRY` constant — maps each City to `{ label, province, lat, lng, weatherQuery }`  
**reason:** Single source of truth for all city metadata — used by TopBar, CiroMap, and the weather API

### TASK 1.3 — Refactor orchestrator data loader
**file:** `src/agents/orchestrator.ts`  
**action:** Replace `loadSignals`/`loadResources` if/else with a dynamic import map keyed on `City`  
**pattern:**
```ts
const SIGNAL_MAP: Record<City, () => Promise<Signal[]>> = {
  karachi: () => import('../data/mock/karachi/signals.json'),
  islamabad: () => import('../data/mock/islamabad/signals.json'),
  // ... all 16
}
```

### TASK 1.4 — Update TopBar city selector
**file:** `src/components/layout/TopBar.tsx`  
**action:** Replace 2 hardcoded `<option>` with grouped `<optgroup>` by province using `CITY_REGISTRY`

### TASK 1.5 — Update CiroMap default center
**file:** `src/components/map/CiroMap.tsx`  
**action:** Use `CITY_REGISTRY[city].lat/lng` to set map center on city change instead of hardcoded coords

---

## PHASE 2 — City Data Authoring (14 cities)

**status:** PENDING  
**depends_on:** Phase 1  
**blocks:** Phase 3 (pipeline needs real data to run)

### OBSERVATION
Each city needs 3 files: `signals.json`, `resources.json`, `scenario.ts`. The signals must span ≥ 3 source types. Resources must use real local agency names. Scenarios must be geographically plausible crises.

### REASONING
City data is the largest volume task. Each city must be treated as a mini-world: real street names, real local authority names, contextually appropriate crisis types. Authoring shortcuts (copy-paste without adaptation) will be caught immediately during demo.

### DECISION
Author cities in batches by province for consistency. Punjab first (most cities), then KPK, Balochistan, Sindh.

---

### TASK 2.1 — Punjab batch (8 cities)

Author data files for: `lahore`, `rawalpindi`, `faisalabad`, `multan`, `gujranwala`, `sialkot`, `bahawalpur`, `sargodha`

**Per-city scenario assignments:**

| City | Crisis 1 | Crisis 2 |
|------|----------|----------|
| lahore | Smog emergency (AQI > 400, Canal Road) | Sectarian protest escalation (Bhati Gate) |
| rawalpindi | Nullah overflow + flash flood (Rawal Lake area) | Gas pipeline rupture (Commercial Market) |
| faisalabad | Industrial chemical spill (D-Ground) | Heatwave + power outage (Clock Tower area) |
| multan | Extreme heatwave (47°C, Hussain Agahi) | Road collapse (Vehari Chowk underpass) |
| gujranwala | Factory fire (Kot Abdul Malik industrial zone) | Water supply contamination (City district) |
| sialkot | Flash flood (Narowal Road, Sialkot Bypass) | Industrial effluent discharge (River Aik) |
| bahawalpur | Desert sandstorm + visibility emergency (Circular Road) | Hospital overcrowding (Victoria Hospital) |
| sargodha | Canal breach (Upper Jhelum Canal) | Locust swarm + crop emergency (outskirts) |

**Signal source rules per city:**
- 3× `social` (Urdu or English, realistic platform data)
- 1× `weather` (stub — replaced at runtime)
- 1× `traffic` (realistic road names, speed data)
- 2× `field_report` (real local agency: PDMA, Rescue 1122, WASA, NHA, GEPCO, SNGPL, etc.)
- 1× `sensor` OR `emergency_call`

**Resource rules per city:**
- 1× `rescue_team` — Rescue 1122 unit (Punjab-specific)
- 1× `police_unit` — local traffic police
- 1× `ambulance` — local DHQ/Teaching Hospital
- 1× `fire_truck` — local fire brigade
- 1× `medical_outreach` or `water_tanker`
- 1× `drone` — Punjab Safe Cities Authority drone

---

### TASK 2.2 — KPK batch (2 cities)

Author data files for: `peshawar`, `abbottabad`

| City | Crisis 1 | Crisis 2 |
|------|----------|----------|
| peshawar | Security incident crowd surge (Qissa Khwani Bazaar) | Flash flood (Kabul River, Ring Road) |
| abbottabad | Earthquake tremors + building collapse (Mandian) | Landslide blocking Karakoram Highway |

**KPK-specific agencies:** KP-PDMA, Rescue 1122 KPK, KP Police, Ayub Medical Complex, ERRA

---

### TASK 2.3 — Balochistan batch (2 cities)

Author data files for: `quetta`, `gwadar`

| City | Crisis 1 | Crisis 2 |
|------|----------|----------|
| quetta | Earthquake (5.8 magnitude, Sariab Road) | Severe winter storm + road closures (N-25 highway) |
| gwadar | Cyclone warning + coastal evacuation (Koh-e-Batil) | Water scarcity emergency + tanker shortage |

**Balochistan-specific agencies:** Balochistan PDMA, Levies Force, CMH Quetta, Pakistan Coast Guards, GDA

---

### TASK 2.4 — Sindh batch (2 cities)

Author data files for: `hyderabad`, `sukkur`

| City | Crisis 1 | Crisis 2 |
|------|----------|----------|
| hyderabad | Industrial fire (SITE area, Hatri Road) | Flash flood + drainage failure (Qasimabad) |
| sukkur | Indus River flood surge (Guddu Barrage area) | Heatwave + hospital capacity crisis (Govt Hospital) |

**Sindh-specific agencies:** Sindh PDMA, Rescue 1122 Sindh, SSGC, WASA Hyderabad, Sukkur Electric Power Company

---

## PHASE 3 — Interactive Pipeline UX

**status:** PENDING  
**depends_on:** Phase 1 (type system)  
**parallel_with:** Phase 2 (city data can be authored simultaneously)

### OBSERVATION
Current UX: user clicks "Run Pipeline" → 7 phases fire automatically → pipeline completes ~12 seconds later. No user agency. No visible "thinking." No scenario context before it starts. The agentic loop is invisible.

### REASONING
The challenge specifically requires the app to demonstrate the "Observation → Reasoning → Decision → Execution" cycle visibly. This is not cosmetic — it is an **evaluation criterion**. Making the pipeline interactive directly satisfies REQ-2 and gives the judge something concrete to follow during a live demo.

The interaction model must feel like a real ops dashboard, not a toy. Operators should feel like they are watching an AI work a problem in real time.

### DECISION
Introduce a `pipelineMode` state machine. Build a `ScenarioBriefing` overlay. Refactor phase execution to pause between phases. Surface agent inner monologue via a dedicated panel component. All implemented with existing dependencies (Framer Motion for animation, Zustand for state).

---

### TASK 3.1 — Extend traceStore with pipeline state machine
**file:** `src/store/traceStore.ts`  
**action:** Add `pipelineMode: 'idle' | 'briefing' | 'running' | 'paused' | 'complete'`  
**action:** Add `currentPhaseIndex: number` and `phaseCount: number`  
**action:** Add actions: `openBriefing()`, `startPipeline()`, `pausePipeline()`, `resumePipeline()`  
**reason:** All UX state must flow from the store — components are stateless consumers

### TASK 3.2 — Build `ScenarioBriefing` overlay component
**file:** `src/components/pipeline/ScenarioBriefing.tsx` (new)  
**triggers:** when `pipelineMode === 'briefing'`  
**content:**
- City name + flag/icon
- "Scenario loaded" — lists signal count and expected crisis types from `CITY_REGISTRY` + scenario metadata
- "AGENT READY — LAUNCH ANALYSIS" CTA button (calls `startPipeline()`)
- "Cancel" link (calls `closeBriefing()`, returns to `idle`)
- Full-screen semi-transparent backdrop with glassmorphism card center

### TASK 3.3 — Build `AgentMonologue` panel component
**file:** `src/components/pipeline/AgentMonologue.tsx` (new)  
**triggers:** renders when `pipelineMode === 'running'`  
**content:**
- Three rows displayed during active phase: `OBSERVATION`, `INFERENCE`, `DECISION`
- Content streams from the active `TraceStep` being processed
- Animates each row in with a 200ms stagger (Framer Motion)
- Collapses to a single status line when phase is `paused` between phases

### TASK 3.4 — Build `PhaseGate` component
**file:** `src/components/pipeline/PhaseGate.tsx` (new)  
**triggers:** renders after each phase completes, before next phase starts  
**content:**
- Shows phase N/7 completion badge
- Summary of outputs: e.g. "3 signals fused — 1 flagged" or "2 crises detected — HIGH severity"
- Auto-advance countdown (2s progress bar)
- "Pause" button stops auto-advance; replaced by "Continue" button when paused
- "Continue" button resumes pipeline

### TASK 3.5 — Refactor `runCIROPipeline` to be phase-gate-aware
**file:** `src/agents/orchestrator.ts`  
**action:** After each `trace.completePhase(...)` call, await a new `waitForGate()` promise  
**pattern:**
```ts
async function waitForGate(): Promise<void> {
  useTraceStore.getState().enterPausedState();
  return new Promise((resolve) => {
    const unsub = useTraceStore.subscribe((s) => {
      if (s.pipelineMode === 'running') { unsub(); resolve(); }
    });
    setTimeout(() => { unsub(); resolve(); }, 2000); // auto-advance
  });
}
```
**action:** Add `openBriefing()` call to `TopBar.tsx` `handleRun` — do NOT call `runCIROPipeline` directly

### TASK 3.6 — Signal map animation
**file:** `src/components/map/CiroMap.tsx`  
**action:** Subscribe to `useSignalStore` signal additions  
**action:** When a new signal appears, render a temporary `PulseMarker` at its lat/lng that fades out after 3s  
**action:** Pin stays permanently as a smaller dot after pulse — color-coded by source type

### TASK 3.7 — Wire briefing into TopBar
**file:** `src/components/layout/TopBar.tsx`  
**action:** `handleRun` calls `useTraceStore.getState().openBriefing()` instead of `runCIROPipeline`  
**action:** `ScenarioBriefing` is rendered in `Shell.tsx` above the content area when `pipelineMode === 'briefing'`

### TASK 3.8 — Add monologue + phase gate to TracePage / Dashboard
**file:** `src/pages/TracePage.tsx` and `src/pages/Dashboard.tsx`  
**action:** Mount `<AgentMonologue />` in TracePage when pipeline is running  
**action:** Mount `<PhaseGate />` in TracePage between phase transitions  
**reason:** TracePage is the natural home for the agentic trace output

---

## PHASE 4 — QA & Integration

**status:** PENDING  
**depends_on:** Phase 2, Phase 3

### TASK 4.1 — TypeScript compile check
**command:** `npm run build`  
**pass criteria:** Zero type errors. All 16 cities resolve correctly in the import map.

### TASK 4.2 — City data completeness audit
**check per city:**
- `signals.json` — 8+ entries, ≥ 3 sources, all IDs use correct prefix
- `resources.json` — 6+ entries, no ID conflicts
- `scenario.ts` — 2 crises, each has `confidenceHistory`, `agentReasoning`, `actions[]`

### TASK 4.3 — Pipeline UX flow test (golden path)
1. Select city → click "Run Pipeline"
2. Briefing overlay appears — correct city name and signal count shown
3. Click "Launch Analysis" → Phase 1 starts
4. Signals stream in one by one — map pins appear with pulse
5. Agent monologue panel shows OBSERVATION / INFERENCE / DECISION
6. Phase 1 completes → PhaseGate shows "Signal Ingestion — COMPLETE — 9 signals ingested"
7. Auto-advance fires after 2s → Phase 2 starts
8. Click "Pause" during Phase 2 → pipeline halts between next phase
9. Click "Continue" → pipeline resumes
10. All 7 phases complete → `pipelineMode: 'complete'`

### TASK 4.4 — Mobile layout check (375px)
- Briefing overlay must not overflow on mobile
- AgentMonologue collapses gracefully
- City selector scrolls properly with 16 options

### TASK 4.5 — Regression check (existing cities)
- Karachi pipeline runs end-to-end with no errors
- Islamabad pipeline runs end-to-end with no errors
- Existing trace, signals, crises, resources pages unaffected

---

## DELIVERY CHECKLIST

- [ ] `src/types/index.ts` — 16-city `City` union
- [ ] `src/data/cities.ts` — `CITY_REGISTRY` with metadata for all 16 cities
- [ ] `src/data/mock/{14 new cities}/signals.json` — all authored
- [ ] `src/data/mock/{14 new cities}/resources.json` — all authored
- [ ] `src/data/mock/{14 new cities}/scenario.ts` — all authored
- [ ] `src/agents/orchestrator.ts` — dynamic import map + phase gate integration
- [ ] `src/store/traceStore.ts` — pipeline state machine
- [ ] `src/components/pipeline/ScenarioBriefing.tsx` — briefing overlay
- [ ] `src/components/pipeline/AgentMonologue.tsx` — inner monologue panel
- [ ] `src/components/pipeline/PhaseGate.tsx` — phase transition gate
- [ ] `src/components/map/CiroMap.tsx` — signal pulse animations
- [ ] `src/components/layout/TopBar.tsx` — grouped city selector + briefing trigger
- [ ] `npm run build` — zero errors

---

## AGENT NOTES

- Do NOT use `any` types — all new city data must be typed via existing `Signal`, `Resource`, `Crisis`, `Action`, `StakeholderMessage` interfaces
- Do NOT add new npm packages — Framer Motion, Leaflet, Zustand, Tailwind are sufficient
- All new Urdu-language signal content must be romanised or use Unicode — no transliteration errors
- The `waitForGate()` pattern must not block the React event loop — use `subscribe` not polling
- `CITY_REGISTRY` is the only file that needs updating if a city is ever added or removed in future
