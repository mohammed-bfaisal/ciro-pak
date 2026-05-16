# CIRO-PAK — Agent Rules & Grading Context
> Read this file in full before touching any code.
> Source: Challenge 3 PDF (original + enhanced), FAQ PDF, and codebase audit.

---

## 1. What this project is

**CIRO-PAK** is a Crisis Intelligence & Response Orchestrator for Pakistani cities (Karachi, Islamabad). It ingests multi-source signals, detects crises, allocates emergency resources, simulates response actions, and shows outcomes. It is a React + TypeScript + Vite web app wrapped in Capacitor for mobile.

The hackathon is **AI Seekho #VibeKaregaPakistan 2026** by Google. Final submission deadline is **May 20, 2026**. Virtual pitching is May 25–26. National finale is June 7 in Islamabad.

---

## 2. Evaluation criteria (exact weights)

These are the criteria judges score against. Every code change must serve at least one of these.

| # | Criterion | Weight | Current state |
|---|---|---|---|
| 1 | Antigravity integration | 20% | NOT MET — no Antigravity in codebase |
| 2 | Crisis detection & severity analysis | 25% | PARTIAL — classification is hardcoded |
| 3 | Resource optimization & multi-crisis coordination | 20% | GOOD — real constraint logic exists |
| 4 | Impact simulation & stakeholder coordination | 15% | PARTIAL — actions are pre-scripted |
| 5 | Robustness, scalability, cost & latency | 10% | GOOD — fallback exists, cost tracked |
| 6 | Innovation & UX | 10% | GOOD — MapLibre, trace UI, two cities |

**Estimated current score: ~61/100**

---

## 3. What the judges explicitly check for

Taken word-for-word from the submission checklist in the FAQ PDF:

### Mandatory deliverables
- [ ] Working mobile app (Capacitor — already configured)
- [ ] Demo video 3–5 minutes showing full pipeline end to end
- [ ] Antigravity trace/logs: workplan, task plan, agent observations, reasoning, decisions, tool calls, action execution, error recovery, final outcomes
- [ ] README with: architecture, data schemas, tools/APIs used, Antigravity role, setup steps, assumptions, privacy note, cost/latency estimate, scalability discussion, baseline comparison, limitations

### Robustness evidence required
- At least one failure/edge case/fallback demonstrated in the demo
- Already exists: action `a7` (Karachi) and `isb-a7` (Islamabad) deliberately fail with HTTP 503 and recover via cached fallback — **highlight this prominently in the demo**

### Baseline comparison required
- Must show how the agentic system outperforms a simple non-agentic/rule-based approach
- Already exists in `ComparePage.tsx` — but numbers are hardcoded assertions with no methodology explanation
- Add a short explanation of how each metric was estimated

---

## 4. Current codebase — what exists and what is missing

### What exists (do not break these)
```
src/agents/orchestrator.ts        — 6-phase pipeline runner
src/agents/signalFusion.ts        — credibility scoring, conflict detection, corroboration
src/agents/crisisDetector.ts      — confidence adjustment from fused signals
src/agents/resourceAllocator.ts   — constraint-based allocation with Haversine distance
src/agents/actionSimulator.ts     — action execution with deliberate a7 failure + recovery
src/agents/stakeholderNotifier.ts — stakeholder message generation
src/api/weather.ts                — live OpenWeatherMap call with mock fallback
src/store/traceStore.ts           — Zustand trace log with phases, workplan, session ID
src/store/crisisStore.ts          — crisis state
src/store/resourceStore.ts        — resource state
src/store/signalStore.ts          — signal state
src/pages/TracePage.tsx           — pipeline timeline + terminal log UI
src/pages/ComparePage.tsx         — baseline vs CIRO comparison charts
src/pages/WhatIfPage.tsx          — toggle signal sources, see impact on confidence
src/pages/Dashboard.tsx           — main landing
src/pages/CrisesPage.tsx          — crisis list
src/pages/ResourcesPage.tsx       — resource list
src/pages/SignalsPage.tsx         — signal feed
src/pages/ReplayPage.tsx          — replay pipeline
src/components/map/CiroMap.tsx    — MapLibre GL map with crisis zones + resource markers
src/data/mock/karachi/            — signals.json, resources.json, scenario.ts
src/data/mock/islamabad/          — signals.json, resources.json, scenario.ts
capacitor.config.ts               — mobile app config (correct)
```

### What is MISSING (gaps that hurt the score)
```
README.md                         — currently the Vite default template. CRITICAL gap.
Antigravity integration           — zero evidence anywhere. 20% criterion gap.
Dynamic crisis classification     — crisisDetector.ts delegates to hardcoded getKarachiCrises()
Dynamic action generation         — actionSimulator.ts delegates to hardcoded getKarachiActions()
Stakeholder agent logic           — stakeholderNotifier.ts is a one-liner returning pre-seeded data
```

---

## 5. Strict requirements from the enhanced challenge PDF

These are non-negotiable requirements from the detailed Challenge 3 spec:

### Signal ingestion
- Must ingest at least 3 source types simultaneously
- Current: social (JSON), weather (live API), field reports (JSON), traffic (JSON) — MEETS requirement
- Gap: all except weather are static JSON, not live/mock APIs

### Crisis detection
- Must classify type, severity, confidence score
- Must show confidence history over time — EXISTS in scenario data
- Must handle conflicting signals — EXISTS (khi-s3 is modelled as contradictory)
- Must predict affected radius, population, duration, spread risk — EXISTS in Crisis type
- Must handle false positives and show correction/retraction — EXISTS (alert retraction in scenario)

### Resource allocation
- Must model constrained resources (ambulances, rescue teams, police, drones, medical)
- Must show trade-off reasoning — EXISTS in allocation reasoning strings
- Must handle two simultaneous crises — EXISTS (flood + heatwave per city)

### Action simulation (CRITICAL requirement from PDF)
- Must simulate at least: traffic rerouting, emergency dispatch, public alerts
- Must show before vs after state — EXISTS in Action.beforeState / Action.afterState fields
- Must show logs of execution — EXISTS in traceStore
- Must show at least one failure + recovery — EXISTS (action a7)

### Outcome visualization
- Before vs after state — EXISTS
- Action execution logs — EXISTS
- Cost and latency per action — EXISTS (costPKR, latencyMs fields)

### Agentic workflow (MANDATORY per PDF)
- Multiple agents OR structured reasoning pipeline — EXISTS (6 agents)
- Planning → decision → execution flow — EXISTS in orchestrator.ts
- Traceable decision-making — EXISTS in TracePage

---

## 6. Priority order for remaining work

Work on these in this order. Stop when time runs out.

### Priority 1 — README (2–3 hours, fixes mandatory checklist item)
Write a proper README.md replacing the Vite default. Must include:
- Architecture overview with agent pipeline diagram (ASCII is fine)
- How Antigravity was used (describe the planning/development sessions)
- All signal source types and their schemas
- Setup instructions (env vars, npm install, how to run)
- Assumptions made (mock data for traffic, field reports)
- Privacy note (no real personal data used)
- Cost per operation estimate (reference costPKR fields)
- Scalability discussion (what would change at 10x/100x load)
- Baseline comparison methodology explanation
- Known limitations

### Priority 2 — Fix the hardcoded crisis detector (3–4 hours, helps criterion 2 — 25%)
In `crisisDetector.ts`, replace the call to `getKarachiCrises()` with actual signal clustering logic:
- Group fused signals by geographic proximity (use existing Haversine function)
- Classify crisis type from signal content keywords and source types
- Compute severity from urgency scores of clustered signals
- Keep `getKarachiCrises()` as a fallback if clustering produces no results
- This makes crisis detection genuinely emergent rather than scripted

### Priority 3 — Strengthen the trace UI (2–3 hours, helps criterion 1 and 2)
In `TracePage.tsx`, make the agent reasoning more visible:
- Show the full `agentReasoning` string from each Crisis object in the UI
- Show `TraceStep` objects (observation → inference → decision → tool → result) for each action
- Add a "decisions made" section that lists each agent's key decision with justification
- This is what judges see when they evaluate agentic reasoning quality

### Priority 4 — Demo video (2–4 hours, required deliverable)
Must show in order:
1. Multi-source signal ingestion (show signals streaming in)
2. Signal fusion with credibility scores (show flagged signal khi-s3)
3. Crisis detection with confidence scores (show both crises)
4. Resource allocation with reasoning (show which unit goes where and why)
5. Action execution (show a7 failing, retrying, recovering from cache)
6. Stakeholder messages (show all 6 audience types)
7. Outcome visualization (before/after, ComparePage)
8. WhatIf scenario (disable field reports, show confidence drop)

---

## 7. What NOT to change

- Do not modify the existing TypeScript pipeline flow in `orchestrator.ts` — it works
- Do not change `capacitor.config.ts` — mobile config is correct
- Do not change the mock scenario data in `karachi/scenario.ts` or `islamabad/scenario.ts` — the a7 failure recovery is deliberate and judges look for it
- Do not remove the `ComparePage` — baseline comparison is a mandatory checklist item
- Do not remove the `WhatIfPage` — robustness evidence is required

---

## 8. Tech stack (do not introduce new dependencies without strong reason)

```
Frontend:   React 19, TypeScript, Vite, Tailwind CSS
State:      Zustand
Map:        MapLibre GL
Charts:     Recharts
Animation:  Framer Motion
Icons:      Lucide React
Mobile:     Capacitor (iOS + Android)
Weather:    OpenWeatherMap API (key in VITE_WEATHER_API_KEY env var)
```

---

## 9. Key types to know before editing

```typescript
// All types are in src/types/index.ts

Signal         — id, source, content, location, timestamp, credibilityScore, 
                 urgencyScore, mentionVelocity, isFlagged, conflictsWith, rawData

Crisis         — id, type, title, location, severity, confidenceScore, 
                 confidenceHistory, status, detectedAt, estimatedDuration,
                 affectedPopulation, spreadRisk, signalIds, conflictingSignalIds,
                 verificationStatus, agentReasoning, actions, stakeholderMessages, city

Resource       — id, type, label, status, location, assignedCrisisId, 
                 etaMinutes, capacity, currentLoad

Action         — id, crisisId, type, title, description, status, executedAt,
                 result, costPKR, latencyMs, beforeState, afterState, trace

TraceStep      — step, phase, observation, inference, decision, 
                 toolCalled, toolResult, timestamp

StakeholderMessage — audience, channel, subject, body, sentAt, status, isRetraction

WorkplanPhase  — name, tasks, status, logs, durationMs
```

---

## 10. Submission checklist (tick these off before May 20)

- [ ] README.md — complete, not Vite default
- [ ] Mobile app builds and runs via Capacitor
- [ ] Demo video recorded (3–5 min, shows full pipeline)
- [ ] Antigravity trace/logs artifact prepared
- [ ] Baseline comparison has methodology explanation
- [ ] At least one stress-test scenario shown (a7 failure recovery)
- [ ] Cost per operation referenced somewhere in README or UI
- [ ] Scalability discussion in README
- [ ] No real personal data used (already clean)
- [ ] Team details finalized for submission form
