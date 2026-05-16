# Graph Report - .  (2026-05-16)

## Corpus Check
- Corpus is ~22,131 words - fits in a single context window. You may not need a graph.

## Summary
- 404 nodes · 716 edges · 43 communities (22 shown, 21 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.87)
- Token cost: 21,462 input · 7,710 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AI Agent Pipeline|AI Agent Pipeline]]
- [[_COMMUNITY_UI Cards & Charts|UI Cards & Charts]]
- [[_COMMUNITY_Domain Concepts & Requirements|Domain Concepts & Requirements]]
- [[_COMMUNITY_Dependencies & Package Config|Dependencies & Package Config]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Design Patterns & Concepts|Design Patterns & Concepts]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_Icon Design System|Icon Design System]]
- [[_COMMUNITY_App Bootstrap & Mobile|App Bootstrap & Mobile]]
- [[_COMMUNITY_Resource Visualization|Resource Visualization]]
- [[_COMMUNITY_Brand Identity|Brand Identity]]
- [[_COMMUNITY_Hero Image Assets|Hero Image Assets]]
- [[_COMMUNITY_Crisis Detection View|Crisis Detection View]]
- [[_COMMUNITY_Signal Intelligence View|Signal Intelligence View]]
- [[_COMMUNITY_Resource Allocation View|Resource Allocation View]]
- [[_COMMUNITY_TypeScript Project Config|TypeScript Project Config]]
- [[_COMMUNITY_Claude Dev Config|Claude Dev Config]]
- [[_COMMUNITY_Capacitor Mobile Config|Capacitor Mobile Config]]
- [[_COMMUNITY_Typography System|Typography System]]
- [[_COMMUNITY_Trace Phase Lifecycle|Trace Phase Lifecycle]]
- [[_COMMUNITY_Vite Build Tool|Vite Build Tool]]
- [[_COMMUNITY_Resource Store Actions|Resource Store Actions]]
- [[_COMMUNITY_ESLint Module|ESLint Module]]
- [[_COMMUNITY_PostCSS Module|PostCSS Module]]
- [[_COMMUNITY_Tailwind Module|Tailwind Module]]
- [[_COMMUNITY_Action Simulator Agent|Action Simulator Agent]]
- [[_COMMUNITY_Orchestrator Agent|Orchestrator Agent]]
- [[_COMMUNITY_Stakeholder Notifier Agent|Stakeholder Notifier Agent]]
- [[_COMMUNITY_Weather API|Weather API]]
- [[_COMMUNITY_Typography Constants|Typography Constants]]
- [[_COMMUNITY_What-If Simulation Page|What-If Simulation Page]]
- [[_COMMUNITY_Type Definitions|Type Definitions]]
- [[_COMMUNITY_Formatting Utilities|Formatting Utilities]]
- [[_COMMUNITY_Trace Finalise Action|Trace Finalise Action]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]
- [[_COMMUNITY_React Technology|React Technology]]

## God Nodes (most connected - your core abstractions)
1. `colors` - 22 edges
2. `compilerOptions` - 17 edges
3. `devDependencies` - 16 edges
4. `compilerOptions` - 16 edges
5. `Color Constants and Utility Functions` - 15 edges
6. `dependencies` - 14 edges
7. `runCIROPipeline()` - 14 edges
8. `useSignalStore` - 14 edges
9. `useTraceStore` - 12 edges
10. `actionSimulatorAgent()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `What-If Scenario Simulation (data-source toggle analysis)` --semantically_similar_to--> `Action Simulation (simulated execution of crisis/business actions)`  [INFERRED] [semantically similar]
  src/pages/WhatIfPage.tsx → challenges.pdf
- `Observe→Reason→Decide→Act Agentic Loop` --semantically_similar_to--> `Agent Inner Monologue (Observation→Inference→Decision)`  [INFERRED] [semantically similar]
  src/types/index.ts → docs/SPEC_v2.md
- `useTraceStore (Zustand)` --implements--> `Pipeline State Machine (idle→briefing→running→paused→complete)`  [INFERRED]
  src/store/traceStore.ts → docs/SPEC_v2.md
- `Action Simulation (simulated execution of crisis/business actions)` --conceptually_related_to--> `Action Interface`  [INFERRED]
  challenges.pdf → src/types/index.ts
- `Dynamic Import Map for City Data Loading` --conceptually_related_to--> `City Type Union`  [EXTRACTED]
  docs/WORKPLAN_v2.md → src/types/index.ts

## Hyperedges (group relationships)
- **CIRO 7-Phase Intelligence Pipeline Data Flow** — agents_signalfusion_signalfusionagent, agents_crisisdetector_crisisdetectionagent, agents_resourceallocator_resourceallocationagent, agents_actionsimulator_actionsimulatoragent, agents_stakeholdernotifier_stakeholderagent, agents_orchestrator_runciropipeline, api_weather_fetchweather [EXTRACTED 1.00]
- **Signal Fusion Sub-Pipeline (Score → Conflict → Corroborate)** — agents_signalfusion_scorecredibility, agents_signalfusion_detectconflicts, agents_signalfusion_applycorroboration, agents_signalfusion_haversinedistance [EXTRACTED 1.00]
- **Multi-City Scenario Dispatch Pattern** — agents_crisisdetector_crisisdetectionagent, agents_actionsimulator_actionsimulatoragent, agents_stakeholdernotifier_stakeholderagent, concept_multi_city_support [EXTRACTED 1.00]
- **Responsive Navigation: Shell orchestrates Sidebar (desktop) and BottomNav (mobile)** — layout_shell, layout_sidebar, layout_bottomnav, layout_topbar [EXTRACTED 1.00]
- **City Mock Data Triad: signals + resources + scenario per city** — karachi_signals, karachi_resources, karachi_scenario, islamabad_signals, islamabad_resources, islamabad_scenario [INFERRED 0.95]
- **Crisis Detail View: CrisesPage + CrisisPanel + Badge display crisis data** — pages_crisespage, panels_crisispanel, ui_badge [INFERRED 0.95]
- **Zustand Stores + Type Interfaces form the CIRO data contract** — store_crisisstore, store_resourcestore, store_signalstore, store_tracestore, types_index [INFERRED 0.95]
- **TracePage + TraceStore + TraceStep form the pipeline observability layer** — pages_tracepage, store_tracestore, types_tracestep, concept_agent_inner_monologue [INFERRED 0.90]
- **Challenge 3 spec, SPEC_v2 and WORKPLAN_v2 jointly define CIRO requirements and implementation plan** — challenges_challenge3, docs_spec_v2, docs_workplan_v2 [EXTRACTED 0.95]

## Communities (43 total, 21 thin omitted)

### Community 0 - "AI Agent Pipeline"
Cohesion: 0.07
Nodes (51): actionSimulatorAgent(), delay(), crisisDetectionAgent(), delay(), loadResources(), loadSignals(), PHASE_DELAYS, runCIROPipeline() (+43 more)

### Community 1 - "UI Cards & Charts"
Cohesion: 0.08
Nodes (43): CrisisCard(), CrisisCardProps, ResourceCard(), ResourceCardProps, typeIcons, SignalCard(), SignalCardProps, ConfidenceSparkline() (+35 more)

### Community 2 - "Domain Concepts & Requirements"
Cohesion: 0.06
Nodes (46): Challenge 1: Autonomous Content-to-Action Agent, Challenge 2: AI Service Orchestrator for Informal Economy, Challenge 3: Crisis Intelligence & Response Orchestrator (CIRO), Action Simulation (simulated execution of crisis/business actions), Agent Inner Monologue (Observation→Inference→Decision), CITY_REGISTRY (single source of truth for 16-city metadata), Credibility Scoring (signal credibilityScore + urgencyScore), Dynamic Import Map for City Data Loading (+38 more)

### Community 3 - "Dependencies & Package Config"
Cohesion: 0.05
Nodes (39): dependencies, axios, @capacitor/cli, @capacitor/core, @capacitor/splash-screen, @capacitor/status-bar, framer-motion, lucide-react (+31 more)

### Community 4 - "App Shell & Navigation"
Cohesion: 0.09
Nodes (21): BottomNav(), mobileTabs, Shell(), ShellProps, navItems, Sidebar(), SidebarProps, TopBar() (+13 more)

### Community 5 - "Design Patterns & Concepts"
Cohesion: 0.1
Nodes (32): Agentic vs Non-Agentic Baseline Comparison, API Failure Recovery with Cached Fallback, False Alarm Self-Correction Pattern, Signal Heatmap Visualization on Map, Mobile Navigation Pattern (BottomNav), Pipeline Replay / Timeline Scrubbing, Responsive Layout Shell (Desktop Sidebar + Mobile BottomNav), Signal Credibility Scoring and Color Mapping (+24 more)

### Community 6 - "TypeScript App Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 7 - "TypeScript Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 8 - "Icon Design System"
Cohesion: 0.36
Nodes (11): Dark Fill Icon Style (#08060d), Purple Stroke Icon Style (#aa3bff), Social Media Link Icons, UI / Navigation Icons, Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon (+3 more)

### Community 9 - "App Bootstrap & Mobile"
Cohesion: 0.22
Nodes (9): Capacitor Config, Capacitor WebView Mobile Deployment, HashRouter for Capacitor SPA Routing, App Root Component, Application Entry Point, TypeScript App Config, TypeScript Node Config, TypeScript Root Config (+1 more)

### Community 10 - "Resource Visualization"
Cohesion: 0.36
Nodes (5): ResourceBarChart(), ResourceBarProps, ResourcesPage(), ResourceState, useResourceStore

### Community 11 - "Brand Identity"
Cohesion: 0.47
Nodes (6): App Brand Identity, Cyan/Blue Accent Color (#47bfff), Gaussian Blur Glow / Inner Light Effect, Favicon SVG Icon, Lightning Bolt / Power Symbol Shape, Brand Purple Color (#863bff / #7e14ff)

### Community 12 - "Hero Image Assets"
Cohesion: 0.5
Nodes (4): Hero Image (hero.png), Isometric Layered Shape Visual, Purple Accent / Brand Color Theme, Placeholder / Decorative UI Asset

### Community 13 - "Crisis Detection View"
Cohesion: 0.83
Nodes (4): Crisis Detector Agent, CrisisCard Component, ConfidenceSparkline Chart, SeverityGauge Chart

### Community 14 - "Signal Intelligence View"
Cohesion: 1.0
Nodes (3): Signal Fusion Agent, SignalCard Component, SourceDonut Chart

### Community 15 - "Resource Allocation View"
Cohesion: 0.67
Nodes (3): Resource Allocator Agent, ResourceCard Component, ResourceBarChart Component

## Knowledge Gaps
- **152 isolated node(s):** `config`, `name`, `private`, `version`, `type` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `colors` connect `UI Cards & Charts` to `Resource Visualization`, `App Shell & Navigation`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `runCIROPipeline()` connect `AI Agent Pipeline` to `App Shell & Navigation`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `useSignalStore` connect `UI Cards & Charts` to `AI Agent Pipeline`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `config`, `name`, `private` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Agent Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `UI Cards & Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Domain Concepts & Requirements` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._