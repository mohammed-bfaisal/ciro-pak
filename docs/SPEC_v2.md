# CIRO — Requirements Specification v2
**session_id:** ciro-spec-v2-20260516  
**source:** MODEL  
**type:** SPECIFICATION  
**status:** DONE  
**created_at:** 2026-05-16T16:30:00Z

---

## OBSERVATION

Current system state after codebase analysis:

- **Cities covered:** 2 only — `karachi`, `islamabad` (hardcoded in `City` type, `TopBar`, `orchestrator.ts`, and `loadSignals`/`loadResources` switch logic)
- **Pipeline UX:** Fully automatic — clicking "Run Pipeline" fires all 7 phases sequentially with no user interaction, no pause, no briefing, no phase gates
- **Signal ingestion:** Signals stream from static JSON files (`signals.json`) plus one live OpenWeatherMap call. No sensor or emergency_call sources exist for any city. Requirement: ≥ 3 distinct live/mock sources per city
- **Agent trace visibility:** Pipeline runs silently until done. Agentic "Observe → Reason → Decide → Act" loop is internal only — nothing surfaces it phase-by-phase in the UI
- **City data structure:** Each city has `signals.json`, `resources.json`, `scenario.ts`. All new cities must follow the same schema exactly

---

## REQUIREMENTS

### REQ-1 — City Coverage

Add the following **14 cities** to the system (brings total from 2 → 16):

| City | Province | Coordinates |
|------|----------|-------------|
| Lahore | Punjab | 31.5204, 74.3587 |
| Rawalpindi | Punjab | 33.6007, 73.0679 |
| Faisalabad | Punjab | 31.4504, 73.1350 |
| Multan | Punjab | 30.1575, 71.5249 |
| Gujranwala | Punjab | 32.1877, 74.1945 |
| Sialkot | Punjab | 32.4945, 74.5229 |
| Bahawalpur | Punjab | 29.3956, 71.6836 |
| Sargodha | Punjab | 32.0830, 72.6748 |
| Peshawar | KPK | 34.0150, 71.5249 |
| Abbottabad | KPK | 34.1463, 73.2117 |
| Quetta | Balochistan | 30.1798, 66.9750 |
| Gwadar | Balochistan | 25.1216, 62.3254 |
| Hyderabad | Sindh | 25.3960, 68.3578 |
| Sukkur | Sindh | 27.7052, 68.8570 |

**Acceptance criteria per city:**
- `signals.json` — minimum 8 signals spanning ≥ 3 distinct sources: `social`, `weather`, `traffic`, `field_report`, plus at least one of `sensor` or `emergency_call`
- `resources.json` — minimum 6 resources with city-appropriate labels (local hospitals, local rescue units, local traffic HQ)
- `scenario.ts` — minimum 2 crises with full `agentReasoning`, `confidenceHistory`, `actions[]`, `stakeholderMessages[]`
- Crisis scenarios must be geographically and contextually plausible for that city (e.g. flooding for Sukkur, heatwave for Multan, earthquake for Quetta/Abbottabad)
- All IDs must use city prefix: `lhr-`, `rwp-`, `fsd-`, `mtn-`, `gjw-`, `skt-`, `bwp-`, `sgd-`, `pew-`, `abt-`, `qta-`, `gwd-`, `hyd-`, `skr-`

---

### REQ-2 — Interactive Pipeline UX

Replace the current fire-and-forget execution model with a **phase-aware interactive pipeline** that surfaces the agentic loop visibly.

#### REQ-2.1 — Scenario Briefing Screen

Before any pipeline phase runs, show a **briefing overlay** when the user clicks "Run Pipeline":

- City name + scenario title
- Number of signals being ingested
- Number of expected crises (estimated)
- A "LAUNCH ANALYSIS" confirm button and a cancel option
- Must feel like a mission brief, not a dialog box

#### REQ-2.2 — Phase-by-Phase Execution with Gates

Each of the 7 pipeline phases must execute individually and surface status:

- Before a phase starts: show `[ PHASE N / 7 ] — Name — PENDING` state
- While running: show `[ PHASE N / 7 ] — Name — RUNNING` with animated indicator
- After completing: show `[ PHASE N / 7 ] — Name — COMPLETE` with a summary of what was found/done
- Auto-advance to next phase after a **2-second pause** (giving the user time to read the result)
- A visible **Pause** button that halts auto-advance between phases (user must click "Continue" to resume)

#### REQ-2.3 — Agent Inner Monologue Panel

During active phase execution, surface the current agentic step visibly in the UI:

- `OBSERVATION:` what the agent is currently reading/processing
- `INFERENCE:` what the agent is concluding from it
- `DECISION:` what action the agent will take next
- This maps directly to the existing `TraceStep` type (`observation`, `inference`, `decision`)
- Panel auto-updates as each action's trace steps are processed

#### REQ-2.4 — Signal Arrival Animation

When signals are ingested (Phase 1), each signal must:
- Appear in the terminal log as it arrives (already done)
- Trigger a visible **map pin drop** at the signal's lat/lng with a brief pulse animation
- Show a brief signal source badge (social / weather / traffic etc.)

#### REQ-2.5 — Pipeline State Machine

Introduce a `pipelineMode` state to the `traceStore`:

```
idle → briefing → running → paused → complete
                    ↕
                  paused
```

- `idle`: no pipeline has run
- `briefing`: briefing overlay is open, pipeline not yet started
- `running`: pipeline is actively executing a phase
- `paused`: pipeline is between phases, waiting for auto-advance or user continue
- `complete`: all 7 phases done

---

### REQ-3 — Signal Sources Completeness

Each city's `signals.json` must include at minimum:

| Source | Count | Notes |
|--------|-------|-------|
| `social` | 3 | Mix of credible + one low-credibility/contradicting to test fusion |
| `weather` | 1 | Stub — real weather fetched at runtime via OpenWeatherMap |
| `traffic` | 1 | Mock traffic congestion data |
| `field_report` | 2 | One from official agency, one from on-ground unit |
| `sensor` OR `emergency_call` | 1 | At least one of these per city |

The weather stub in `signals.json` is replaced at runtime by the live OpenWeatherMap fetch — the stub exists so offline mode still has a weather entry.

---

### REQ-4 — Type System Updates

- `City` type in `src/types/index.ts` must be updated to union of all 16 city strings
- `orchestrator.ts` `loadSignals` and `loadResources` must use a dynamic import map, not a binary if/else
- `TopBar.tsx` city selector must list all 16 cities grouped by province
- `CiroMap.tsx` default centre/zoom must adapt per city

---

## CONSTRAINTS

- No new dependencies — use existing stack (React, Zustand, Leaflet, Framer Motion, Tailwind)
- No backend — all signal data remains mock JSON; only OpenWeatherMap API call is live
- All new city data must be realistic — real street names, real local agencies (PDMA, Rescue 1122, WASA, NHA, etc.)
- The agentic reasoning in `scenario.ts` files must follow the exact multi-bullet format established in Karachi/Islamabad scenarios
- All Tailwind + color system usage must stay within existing `colors.ts` and `typography.ts` constants
- Mobile-first layout must not break — test at 375px width

---

## OUT OF SCOPE (v2)

- Real-time WebSocket signal feeds
- Actual API integrations beyond OpenWeatherMap
- User authentication
- Database persistence
- Map routing / navigation overlays
