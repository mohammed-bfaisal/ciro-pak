# CIRO — 911 Operator UI & Challenge 3 Implementation Plan

**Challenge:** Crisis Intelligence & Response Orchestrator (CIRO) — Challenge 3, AI Seekho Hackathon 2026  
**Deadline:** May 20, 2026 (final submission)  
**Stack:** React + MapLibre GL + Zustand + Capacitor (mobile mandatory) + OpenRouter (LLM, pending key)

---

## What This Document Covers

1. The 911 Operator–inspired map UI (visual redesign)
2. Three-button interaction model: **Simulate**, **Manual Dispatch**, **AI Dispatch**
3. Challenge 3 agent pipeline compliance
4. Agent real-functionality design (OpenRouter-ready)
5. Implementation phases

---

## Part 1 — 911 Operator UI Reference

| Element           | Description                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Full-screen map   | Top-down city map, dark tile style                                                                       |
| Unit icons        | Vehicle icons by type, color-coded by status (pinned to actual road locations on the map)                |
| Moving units      | Vehicles animate along roads toward their assigned incident (always follow a real road path)             |
| Route lines       | Polyline from unit → target incident                                                                     |
| Incident markers  | Flashing, color-coded circles (blue=police, red=fire, white=medical)                                     |
| Bottom-left HUD   | Unit roster panel — all units with status chips                                                          |
| Bottom-right HUD  | Incident registry panel — all active crises                                                              |
| Click-to-dispatch | Click unit → select crisis → unit dispatched, line drawn, movement starts (this is done in manual mode.) |
| Status badges     | Available (green), En Route (amber), On Scene (red), Returning (gray)                                    |
| Incoming alert    | Pulsing "new incident" animation on crisis markers                                                       |

---

## Part 2 — Three-Button Interaction Model

Three buttons sit in a control bar at the top center of the dashboard. They are independent — Simulate can run without Dispatch active, and either dispatch mode can be used while simulation is paused.

```
┌──────────────────────────────────────────────────────────────────┐
│   [▶ SIMULATE]          [👤 MANUAL DISPATCH]   [🤖 AI DISPATCH]  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Button 1: SIMULATE

> "Start the city. Incidents happen. Signals come in. I watch."

**What it does:**

Starts a real-time incident engine. Crises do not all appear at once — they emerge progressively, as signals arrive and fuse into detectable patterns. Pressing again pauses the engine. Time controls (1×/2×/4×) are visible while running.

**Tick-by-tick behavior:**
1. Every N seconds (scaled by simulation speed), new signals arrive on the map — social posts, weather readings, traffic spikes, field reports
2. `SignalFusion` runs continuously in the background, clustering signals by location and time
3. When a cluster's confidence crosses a threshold, `CrisisDetector` promotes it to an active crisis — crisis marker flashes onto the map
4. Crisis markers pulse and show: type icon, severity color, confidence percentage
5. The Incident Registry (bottom-right HUD) updates as new crises appear
6. PipelineTimeline shows live agent reasoning: "Cluster A reached 78% confidence → promoting to active crisis"
7. Resources stay in place and are NOT dispatched — this button only generates the situation, it does not respond to it

**State changes on press:**
- `simulationRunning: boolean` → true
- Signals stream in from the city's signal dataset at configurable intervals
- Crises emerge from signal fusion (not all at once — staged over time for realism)
- Units on map remain at home base, available, waiting for dispatch

**Why separate from dispatch:** Simulation is observation. Dispatch is action. Separating them lets the user (and judges) see the AI's detection capability independently from its response capability. In a demo, you press Simulate, watch the city come alive with incidents, then choose how to respond.

---

### Button 2: MANUAL DISPATCH

> "I'm the commander. I decide who goes where."

**Trigger:** Click **[👤 MANUAL DISPATCH]** — button highlights, map enters dispatch-select mode.

**What appears:**
- Unit Roster panel (bottom-left HUD) — all units with status dots
- Incident Registry panel (bottom-right HUD) — all active crises
- Time controls pill (pause/1×/2×/4×)

**Dispatch flow:**
1. Click a unit row in the roster OR click its icon on the map → unit gets a yellow selection ring
2. Click a crisis marker OR a crisis row in the registry → dispatch confirmed
3. Route line draws from unit to crisis, unit begins moving on map
4. Unit status → En Route (amber), ETA countdown shown
5. On arrival: status → On Scene (red), marker settles

**Also available while Manual Dispatch is active:**
- Clicking an already-dispatched unit shows its current assignment and ETA
- Units that arrive on scene automatically transition after `etaMinutes`, without user action
- Units can be reassigned mid-route by clicking them and selecting a new crisis

**State when active:** `dispatchMode: 'manual'` in resourceStore

---

### Button 3: AI DISPATCH

> "Let the AI handle it. Show me the reasoning."

**Trigger:** Click **[🤖 AI DISPATCH]** — runs the full `ResourceAllocator` + `ActionSimulator` + `StakeholderNotifier` pipeline against whatever crises are currently active.

**What it does:**
1. `ResourceAllocator` scores every (unit, crisis) pair — type match, travel time, severity weight, resource availability
2. Produces an optimal allocation plan with per-assignment reasoning
3. `ActionSimulator` executes the plan: 3–5 chained actions per crisis (dispatch → reroute → notify hospital → public alert → utility escalate)
4. `StakeholderNotifier` generates per-audience messages
5. All assignments animate on the map simultaneously — multiple units begin moving
6. PipelineTimeline shows the full AI reasoning trace: what was observed, inferred, decided, and executed
7. Alert banner appears: "AI dispatched 5 units across 2 crises. 3 stakeholder alerts sent."

**Before/after state panel** slides up from the bottom showing:
```
Before: { congestion: "critical", resources_on_scene: 0, public_alerts: 0 }
After:  { congestion: "moderate", resources_on_scene: 3, public_alerts: 14,000 }
```

**Failure simulation:** 1 in 5 action chains deliberately fails (simulated API timeout), then retries or rolls back — shown in the trace log. This satisfies the challenge's robustness requirement.

**State when active:** `dispatchMode: 'ai'` in resourceStore. The button is disabled while the pipeline is running (shows spinner), re-enables when complete.

**Relationship to Simulate:** AI Dispatch can run whether Simulate is running or paused. If Simulate is paused and no crises exist yet, AI Dispatch shows "No active incidents to respond to." If Simulate is running, AI Dispatch responds to whatever crises currently exist at that moment.

---

## Part 3 — Challenge 3 Compliance Map

| Challenge 3 Requirement | How CiroPak Satisfies It |
|---|---|
| Ingest ≥3 signal sources | Social posts, weather API (mock), traffic maps, emergency calls, field reports — all in `signals.json` |
| Detect crisis type, severity, confidence, population, duration | `CrisisDetector` agent + `crisisStore` fields already typed |
| Source credibility scoring | `credibilityScore`, `mentionVelocity`, `conflictsWith` on Signal type |
| Contradiction detection & false alarm handling | `signalFusion` agent reconciles conflicting signals, `verificationStatus` on Crisis |
| Resource allocation optimization across simultaneous crises | `ResourceAllocator` agent with constrained dispatch logic |
| Multi-crisis coordination (2+ simultaneous) | Both Karachi and Islamabad datasets have multiple simultaneous crises |
| Impact simulation with before/after state | `actionSimulator` + `Action.beforeState`/`afterState` already typed |
| Stakeholder notifications (tailored per audience) | `StakeholderMessage` type with audience/channel/body already exists |
| False positive retraction flow | `verificationStatus: 'retracted'`, `isRetraction: true` on messages |
| Agentic workflow with traceable reasoning | `orchestrator` → `signalFusion` → `crisisDetector` → `resourceAllocator` → `actionSimulator` → `stakeholderNotifier` |
| Robustness / degraded mode | Fallback to mock data when signals are stale or API unavailable |

### Evaluation Criteria Alignment

| Criterion | Weight | Our Approach |
|---|---|---|
| Antigravity integration | 20% | OpenRouter as LLM backbone; agent orchestration replaces Antigravity role (documented) |
| Crisis detection & severity analysis | 25% | CrisisDetector with multi-signal fusion, confidence scoring, evolution prediction |
| Resource optimization & multi-crisis coordination | 20% | ResourceAllocator with constrained optimization, multi-crisis trade-offs |
| Impact simulation & stakeholder coordination | 15% | ActionSimulator before/after states + StakeholderNotifier per-audience messages |
| Robustness, scalability, cost & latency | 10% | Fallback chains, cost tracking in `costPKR`, latency in `latencyMs` |
| Innovation & UX | 10% | 911 Operator dispatch UI, animated map, two-mode interaction |

---

## Part 4 — Agent Real-Functionality Design

All agents currently output mock/hardcoded data. With OpenRouter plugged in, each agent sends a real LLM prompt and parses the structured response. Until then, the agent functions run deterministic simulation logic that can be swapped for LLM calls by changing one function.

### Agent Contract (shared interface)

Every agent function takes typed inputs and returns typed outputs. The orchestrator calls them in sequence.

```
signals[] → SignalFusion → fusedSignals[] + contradictions[]
fusedSignals[] → CrisisDetector → crises[] + confidenceScores
crises[] + resources[] → ResourceAllocator → allocationPlan[]
allocationPlan[] → ActionSimulator → actions[] + beforeAfterStates
crises[] → StakeholderNotifier → messages[] per audience
```

---

### 4.1 SignalFusion Agent

**Real job:** Fuse multi-source signals into a coherent picture. Detect contradictions, score credibility, filter noise.

**Input:** `Signal[]` (all raw signals for a city)  
**Output:** `{ fusedClusters: FusedCluster[], contradictions: ContradictionPair[], noiseIds: string[] }`

**Logic (deterministic stub, replaceable with LLM):**
```ts
// Group signals by geo-proximity (< 2km radius) and time window (< 30 min)
// Score each cluster: avg credibilityScore × mentionVelocity weight
// Flag contradictions: signals in same cluster with conflicting content
// Filter noise: credibilityScore < 0.3 and single-source
// Output: clusters ready for CrisisDetector
```

**LLM prompt (OpenRouter):**
```
You are a crisis intelligence system. Given these signals from multiple sources,
identify clusters that indicate real emerging situations, score their credibility,
flag contradictions between sources, and filter noise. Output JSON only.
```

**Trace output (visible in PipelineTimeline):**
- "Clustered 8 signals into 2 crisis clusters"
- "Contradiction detected: Signal A says flood, Signal B says blocked drain — flagging for verification"
- "Filtered 3 low-credibility social posts (score < 0.3)"

---

### 4.2 CrisisDetector Agent

**Real job:** For each fused cluster, classify the crisis, estimate severity, predict evolution.

**Input:** `FusedCluster[]`  
**Output:** `Crisis[]` (fully populated, including `confidenceScore`, `affectedPopulation`, `spreadRisk`, `estimatedDuration`)

**Logic (deterministic stub):**
```ts
// Map cluster type signals to CrisisType (flood, heatwave, accident, etc.)
// Severity = f(mentionVelocity, urgencyScore, signalCount, source diversity)
// affectedPopulation = estimated from crisis type + affected radius (lookup table)
// spreadRisk = 'expanding' if mentionVelocity > threshold, else 'contained'
// confidenceScore = weighted avg of signal credibility scores
```

**LLM prompt (OpenRouter):**
```
Given this fused signal cluster for an urban crisis in Pakistan, classify the crisis type,
estimate severity (low/medium/high/critical), affected population, spread risk,
and provide your confidence score with reasoning. Output JSON only.
```

**Trace output:**
- "Detected: Urban flooding, G-10 Islamabad — Confidence: 87%, Critical severity"
- "Conflicting signal (water main vs flood) — holding at 'unverified', requesting field confirmation"

---

### 4.3 ResourceAllocator Agent

**Real job:** Given active crises and available resources, produce an optimal allocation plan respecting constraints.

**Input:** `Crisis[]`, `Resource[]`  
**Output:** `ResourceAllocation[]` with reasoning per assignment

**Constraints to model:**
- Resource type must match crisis type (e.g., fire_truck for fire, water_tanker for flood)
- Only `status === 'available'` resources can be dispatched
- Multi-crisis: if 2 crises compete for same resource, prioritize by severity × confidence × affected population
- ETA = haversine distance / avg speed (ambulance: 30 km/h urban, rescue: 25 km/h)

**Logic (deterministic stub):**
```ts
// Score each (resource, crisis) pair: typeMatch × (1/etaMinutes) × crisis.severityWeight
// Greedy assignment: highest score first, mark resource as dispatched
// If no matching resource available: flag crisis as 'needs_escalation'
// Return reasoning string per assignment
```

**LLM prompt (OpenRouter):**
```
You are a crisis resource coordinator. Given these active crises with severity scores
and these available emergency resources with locations, produce an optimal dispatch plan.
Explain each assignment decision. Output JSON only.
```

**Trace output:**
- "Assigned Ambulance KHI-07 → Lyari Flood (closest, ETA 4 min, only ambulance available)"
- "Cannot assign fire_truck to heatwave — type mismatch, substituting medical_outreach"
- "2 crises compete for NDMA Rescue Unit Alpha — prioritizing G-10 flood (critical > high)"

---

### 4.4 ActionSimulator Agent

**Real job:** For each allocation, simulate execution of a chain of 3–5 actions and show before/after system state.

**Input:** `ResourceAllocation[]`, `Crisis[]`  
**Output:** `Action[]` with `beforeState`, `afterState`, `status`, `result`, `latencyMs`, `costPKR`

**Action chain per crisis (example: flooding):**
1. `traffic_reroute` — update mock map routes, estimate congestion reduction
2. `emergency_dispatch` — mark resource as en_route, start movement animation
3. `hospital_notify` — generate hospital prep message, estimate bed readiness
4. `public_alert` — generate SMS text, estimate reach
5. `utility_escalate` — notify KW&SB / WAPDA (if relevant)

**Before/after state (shown in UI):**
```json
{
  "beforeState": { "congestionLevel": "critical", "resourcesOnScene": 0, "publicAlertsOut": 0 },
  "afterState":  { "congestionLevel": "moderate",  "resourcesOnScene": 2, "publicAlertsOut": 14000 }
}
```

**Failure & recovery simulation:**
- 20% chance an action fails (simulated API timeout)
- On failure: retry once, then rollback to `beforeState`, log recovery step
- This satisfies the "robustness evidence" requirement

---

### 4.5 StakeholderNotifier Agent

**Real job:** Generate tailored messages for each audience type based on crisis details.

**Input:** `Crisis`, `Action[]`  
**Output:** `StakeholderMessage[]` (one per audience-channel pair)

**Audience → channel → message type:**
| Audience | Channel | Content |
|---|---|---|
| public | sms | Simple Urdu/English alert: location, severity, what to do |
| emergency_services | dashboard | Full crisis brief: type, resources assigned, ETA, coordination notes |
| hospitals | email | Expected casualties estimate, injury types, resource needs |
| utility_company | email | Infrastructure damage report, escalation request |
| transport_authority | dashboard | Rerouting instructions, affected roads |
| media | dashboard | Press-ready summary (not for alarm, just factual) |

**LLM prompt (OpenRouter):**
```
Generate a stakeholder notification for the following crisis in Pakistan.
Audience: [public/hospital/etc]. Channel: [SMS/email/dashboard].
Keep it factual, appropriate for the audience, and actionable. Avoid panic.
```

---

### 4.6 Orchestrator

**Real job:** Run the full pipeline in sequence, handle failures, expose trace to UI.

```ts
async function runOrchestration(city: City) {
  emit('phase:start', 'signal_fusion')
  const { fusedClusters, contradictions } = await signalFusion(signals)
  
  emit('phase:start', 'crisis_detection')
  const crises = await crisisDetector(fusedClusters)
  setCrises(crises)
  
  emit('phase:start', 'resource_allocation')
  const plan = await resourceAllocator(crises, resources)
  plan.forEach(a => dispatchUnit(a.resourceId, a.crisisId))
  
  emit('phase:start', 'action_simulation')
  const actions = await actionSimulator(plan, crises)
  setActions(actions)
  
  emit('phase:start', 'stakeholder_notify')
  const messages = await stakeholderNotifier(crises, actions)
  setMessages(messages)
  
  emit('pipeline:complete', { crises, actions, messages })
}
```

Each `emit` updates `traceStore` → displayed live in `PipelineTimeline`.

---

## Part 5 — OpenRouter Integration (Pending Key)

All agent functions are written with a `callLLM(prompt: string): Promise<string>` abstraction.

```ts
// src/api/llm.ts
export async function callLLM(prompt: string): Promise<string> {
  if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
    return runDeterministicFallback(prompt) // current mock behavior
  }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  })
  const data = await res.json()
  return data.choices[0].message.content
}
```

When the key is added to `.env`, all agents upgrade from deterministic stubs to real LLM reasoning — zero other code changes needed.

---

## Part 6 — 911 UI Implementation Phases

### Phase 1 — Vehicle Markers on Map (Static)

Render every resource as a typed icon on the map.

**Type changes in `src/types/index.ts`:**
```ts
// Add to Resource interface:
currentPosition: GeoPoint;   // live animated position
targetPosition?: GeoPoint;   // dispatch destination
movementProgress: number;    // 0.0 → 1.0
```

**`src/components/map/VehicleMarker.ts` (new):**

| Type | Icon | Available | En Route | On Scene |
|---|---|---|---|---|
| ambulance | 🚑 | `#22c55e` | `#f59e0b` | `#ef4444` |
| police_unit | 🚓 | `#3b82f6` | `#f59e0b` | `#ef4444` |
| fire_truck | 🚒 | `#ef4444` | `#f59e0b` | `#dc2626` |
| rescue_team | 🦺 | `#22c55e` | `#f59e0b` | `#ef4444` |
| water_tanker | 🚰 | `#06b6d4` | `#f59e0b` | `#ef4444` |
| medical_outreach | ⛑️ | `#22c55e` | `#f59e0b` | `#ef4444` |
| drone | 🛸 | `#a855f7` | `#f59e0b` | `#ef4444` |

**Files:** `src/types/index.ts`, `src/components/map/CiroMap.tsx`, `src/components/map/VehicleMarker.ts`, both `resources.json`

---

### Phase 2 — Movement Simulation Engine

Animate units from home → crisis over `etaMinutes`.

**`src/simulation/movementEngine.ts` (new):**
```ts
export function tickMovement(resources: Resource[], deltaMinutes: number): Resource[]
// Lerp currentPosition between location and targetPosition using movementProgress
// On arrival: set status = 'on_scene'
// On return: animate back to location, set status = 'available'
```

**`src/store/resourceStore.ts` additions:**
```ts
simulationSpeed: 1 | 2 | 4
isPaused: boolean
tick: () => void
setSpeed: (s: 1|2|4) => void
togglePause: () => void
```

**Dashboard tick loop:**
```ts
useEffect(() => {
  if (isPaused) return
  const id = setInterval(() => tick(), 1000 / simulationSpeed)
  return () => clearInterval(id)
}, [isPaused, simulationSpeed])
```

**Files:** `src/simulation/movementEngine.ts`, `src/store/resourceStore.ts`, `src/pages/Dashboard.tsx`

---

### Phase 3 — Route Lines on Map

Dashed polyline from each moving unit to its target.

**Single GeoJSON source `'unit-routes'` in MapLibre:**
```ts
{
  type: 'line',
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 2,
    'line-dasharray': [4, 3],
    'line-opacity': 0.75,
  }
}
```

**`src/components/map/RouteLayer.ts` (new):** `initRouteLayer()` + `updateRouteLayer()` called each tick.

**Files:** `src/components/map/RouteLayer.ts`, `src/components/map/CiroMap.tsx`

---

### Phase 4 — Bottom HUD Panels

911 Operator style control panels.

**`src/components/hud/UnitRoster.tsx`** — bottom-left, collapsible:
```
┌─────────────────────────────┐
│  UNITS (8)        [collapse]│
├─────────────────────────────┤
│ 🚑 Edhi Amb KHI-07          │
│    ● En Route → Flood Zone  │
│    ETA: 4 min               │
├─────────────────────────────┤
│ 🚓 Traffic Police T-14      │
│    ● Available   [Dispatch] │
└─────────────────────────────┘
```

**`src/components/hud/IncidentRegistry.tsx`** — bottom-right, collapsible:
```
┌─────────────────────────────┐
│  INCIDENTS (3)   [collapse] │
├─────────────────────────────┤
│ 🔴 Lyari Flash Flood        │
│    Critical · 2 units       │
├─────────────────────────────┤
│ 🟡 KESC Power Outage        │
│    High · 0 units ⚠ Needs   │
└─────────────────────────────┘
```

**`src/components/hud/TimeControls.tsx`** — center bottom pill: `[⏸] [1×] [2×] [4×]`

**Files:** `src/components/hud/UnitRoster.tsx`, `src/components/hud/IncidentRegistry.tsx`, `src/components/hud/DispatchBadge.tsx`, `src/components/hud/TimeControls.tsx`, `src/pages/Dashboard.tsx`

---

### Phase 5 — Three-Button Control Bar + Dispatch Flows

**Dashboard top-center control bar (`src/components/hud/ControlBar.tsx`):**
```tsx
<SimulateButton />      // toggles simulationRunning, drives signal/crisis stream
<ManualDispatchButton /> // sets dispatchMode = 'manual', shows HUD panels
<AIDispatchButton />    // runs full ResourceAllocator + ActionSimulator pipeline
```

**Store additions (`src/store/resourceStore.ts`):**
```ts
simulationRunning: boolean
dispatchMode: 'off' | 'manual' | 'ai'
selectedUnitId: string | null

toggleSimulation: () => void
setDispatchMode: (mode: 'off' | 'manual' | 'ai') => void
selectUnit: (id: string | null) => void
dispatchUnit: (unitId: string, crisisId: string, targetLoc: GeoPoint, etaMinutes: number) => void
runAIDispatch: () => Promise<void>   // calls orchestrator pipeline
```

**Simulation engine (`src/simulation/incidentEngine.ts` — new):**
```ts
// Called every N seconds while simulationRunning = true
// Picks the next signal batch from the city dataset
// Runs SignalFusion → if confidence > threshold → CrisisDetector → adds crisis to store
export function tickSimulation(city: City, signalStore, crisisStore): void
```

**Manual dispatch interaction in `CiroMap.tsx`:**
- When `dispatchMode === 'manual'` and `selectedUnitId !== null`: all crisis markers get a pulsing select-ring
- Click a crisis marker → calls `dispatchUnit(selectedUnitId, crisisId, ...)`
- Map cursor changes to crosshair while a unit is selected

**AI Dispatch pipeline in `src/simulation/dispatchEngine.ts`:**
```ts
export async function runAIDispatch(crises, resources, stores): Promise<void> {
  const plan = await resourceAllocator(crises, resources)
  const actions = await actionSimulator(plan, crises)
  const messages = await stakeholderNotifier(crises, actions)
  plan.forEach(a => dispatchUnit(a.resourceId, a.crisisId, ...))
  setActions(actions)
  setMessages(messages)
}
```

**Files:** `src/components/hud/ControlBar.tsx` (new), `src/simulation/incidentEngine.ts` (new), `src/simulation/dispatchEngine.ts` (new), `src/store/resourceStore.ts`, `src/components/map/CiroMap.tsx`

---

### Phase 6 — Visual Polish & Stress-Test Scenarios

**Animations:**
- New crisis marker: fast double-pulse for first 10s
- Unit arrival at scene: brief scale-up pulse
- Unit facing direction: CSS `rotate(bearing deg)`
- New crisis flash: 3× amber border pulse on full screen edge

**Stress-test scenarios (hardcoded in mock data, triggerable):**
- Two simultaneous crises competing for NDMA Rescue Unit Alpha
- Social media signal contradicts sensor data → system shows "conflicting signals" state
- One action fails mid-chain → retry → rollback shown in trace
- False alarm retraction flow: crisis downgraded from "active" to "false_alarm", retraction message sent

**`src/index.css` additions:**
```css
@keyframes vehicle-arrive { 0% { transform: scale(1); } 50% { transform: scale(1.6); } 100% { transform: scale(1); } }
@keyframes fast-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes alert-border { 0%,100% { box-shadow: none; } 50% { box-shadow: 0 0 0 4px #f59e0b; } }
```

---

## Implementation Order & Effort

| # | Phase | Effort | Visible Result |
|---|---|---|---|
| 1 | Vehicle markers (static) | ~2h | Units appear on map as icons |
| 2 | Movement engine + tick | ~2h | Units slide toward crises |
| 3 | Route polylines | ~1h | Dashed lines unit→crisis |
| 4 | HUD panels | ~3h | Bottom panels with lists |
| 5 | Simulate + Dispatch buttons | ~3h | Full two-mode interaction |
| 6 | Visual polish + scenarios | ~1h | Animations, stress tests |
| 7 | Agent real logic stubs | ~3h | Deterministic pipeline runs end-to-end |
| 8 | OpenRouter wiring | ~1h | Swap in LLM when key arrives |

**Total: ~16h**

---

## Non-Goals

- Real road routing (OSRM) — linear lerp sufficient for simulation
- Real weather/traffic APIs — mock data with the right schema is acceptable per challenge rules
- Replacing existing CrisisPanel / SignalFeed / TracePage components
- Backend server — all logic runs client-side

---

## Key Design Decisions

1. **Two-button model (Simulate vs Dispatch):** Cleanly separates the AI pipeline run from the human control layer. Simulate is "watch the AI think." Dispatch is "I'm the commander." This makes both the agentic capability and the 911 operator UX clearly visible to judges.

2. **`callLLM()` abstraction:** One function, one env var. Deterministic stubs run today. LLM runs when the OpenRouter key arrives. Zero refactoring needed.

3. **Real agent contracts with typed I/O:** Each agent has a defined input and output type. They chain. The orchestrator is just a sequence of await calls with trace events. This satisfies the "traceable decision-making" and "agentic workflow" criteria directly.

4. **Before/after state on every action:** The `Action.beforeState` / `afterState` fields satisfy "outcome visualization" and "clear system state change" — two separate evaluation criteria — with one data structure.

5. **Stress-test scenarios in mock data:** False alarms, competing resources, API failures — baked into the Karachi dataset so judges can trigger them on demand during the demo.
