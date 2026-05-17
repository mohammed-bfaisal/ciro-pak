import { useTraceStore } from '../store/traceStore';
import { useSignalStore } from '../store/signalStore';
import { useCrisisStore } from '../store/crisisStore';
import { useResourceStore } from '../store/resourceStore';
import { signalFusionAgent } from './signalFusion';
import { crisisDetectionAgent } from './crisisDetector';
import { resourceAllocationAgent } from './resourceAllocator';
import { actionSimulatorAgent } from './actionSimulator';
import { stakeholderAgent } from './stakeholderNotifier';
import { fetchWeather } from '../api/weather';
import { haversineDistance } from '../utils/geo';
import type { City, Signal, Resource } from '../types';

import karachiSignals from '../data/mock/karachi/signals.json';
import karachiResources from '../data/mock/karachi/resources.json';
import islamabadSignals from '../data/mock/islamabad/signals.json';
import islamabadResources from '../data/mock/islamabad/resources.json';

const PHASE_DELAYS = {
  ingestion:   800,
  fusion:     1200,
  detection:   900,
  allocation:  600,
  execution:  2000,
  notify:      500,
  correction:  400,
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadSignals(city: City): Signal[] {
  return (city === 'karachi' ? karachiSignals : islamabadSignals) as Signal[];
}

function loadResources(city: City): Resource[] {
  return (city === 'karachi' ? karachiResources : islamabadResources) as Resource[];
}

// ─── SIMULATE: ingestion → fusion → crisis detection ───────────────────────
export async function runSimulation(city: City) {
  const trace = useTraceStore.getState();
  const signals = useSignalStore.getState();
  const crisisStore = useCrisisStore.getState();
  const resourceStore = useResourceStore.getState();

  signals.reset();
  crisisStore.reset();
  resourceStore.reset();
  trace.reset();
  trace.startSession(city);

  // Phase 1 — Signal Ingestion
  trace.startPhase('Signal Ingestion', [
    `Loading ${city} social posts...`,
    `Loading ${city} field reports...`,
    `Fetching weather — ${city}...`,
    `Loading ${city} traffic data...`,
  ]);
  const rawSignals = loadSignals(city);
  const weather = await fetchWeather(city);
  const allSignals = [...rawSignals, weather];
  signals.setRaw(allSignals);

  for (const signal of allSignals) {
    await delay(600);
    useSignalStore.getState().addSignal(signal);
    trace.log(`Ingested: ${signal.source} — "${signal.content.slice(0, 60)}..."`);
  }
  trace.completePhase('Signal Ingestion', PHASE_DELAYS.ingestion);

  // Phase 2 — Signal Fusion
  trace.startPhase('Signal Fusion', [
    'Scoring credibility per source...',
    'Detecting conflicts...',
    'Applying corroboration bonuses...',
  ]);
  await delay(PHASE_DELAYS.fusion);
  const fusedSignals = signalFusionAgent(allSignals, city);
  useSignalStore.getState().setFused(fusedSignals);
  fusedSignals.forEach((s) => {
    trace.log(`Scored ${s.id} (${s.source}): credibility ${s.credibilityScore.toFixed(2)}${s.isFlagged ? ' ⚠ FLAGGED' : ''}`);
  });
  trace.completePhase('Signal Fusion', PHASE_DELAYS.fusion);

  // Phase 3 — Crisis Detection
  trace.startPhase('Crisis Detection', [
    'Clustering signals by location...',
    'Classifying crisis types...',
    'Estimating severity + confidence...',
  ]);
  await delay(PHASE_DELAYS.detection);
  const crises = crisisDetectionAgent(fusedSignals, city);
  crises.forEach((c) => {
    useCrisisStore.getState().addCrisis(c);
    trace.log(
      `Crisis: ${c.type.toUpperCase()} — ${c.location.label} — ${Math.round(c.confidenceScore * 100)}% confidence — ${c.severity.toUpperCase()}`
    );
  });
  trace.completePhase('Crisis Detection', PHASE_DELAYS.detection);

  // Load resources so they appear on map at home locations (not dispatched)
  const resources = loadResources(city);
  useResourceStore.getState().setResources(resources);

  trace.finalise();
}

// ─── AI DISPATCH: allocation → execution → notifications → correction ───────
export async function runAIDispatch(city: City) {
  const trace = useTraceStore.getState();
  const crises = useCrisisStore.getState().crises;
  const existingResources = useResourceStore.getState().resources;

  if (crises.length === 0) {
    trace.log('⚠ No active crises — run SIMULATE first');
    return;
  }

  const resources = existingResources.length > 0
    ? existingResources
    : loadResources(city);

  if (existingResources.length === 0) {
    useResourceStore.getState().setResources(resources);
  }

  // Phase 4 — Resource Allocation
  trace.startPhase('Resource Allocation', [
    'Loading available resources...',
    'Computing travel times...',
    'Solving allocation constraints...',
  ]);
  await delay(PHASE_DELAYS.allocation);

  const allocations = resourceAllocationAgent(crises, resources);
  allocations.forEach((a) => {
    const crisis = crises.find((c) => c.id === a.crisisId);
    if (!crisis) return;
    const unit = resources.find((r) => r.id === a.resourceId);
    const distKm = haversineDistance(
      unit?.currentPosition?.lat ?? crisis.location.lat,
      unit?.currentPosition?.lng ?? crisis.location.lng,
      crisis.location.lat,
      crisis.location.lng
    );
    const etaMinutes = Math.max(2, Math.round((distKm / 30) * 60));
    useResourceStore.getState().dispatchUnit(a.resourceId, a.crisisId, crisis.location, etaMinutes);
    trace.log(`Dispatched ${a.resourceId} → ${a.crisisId}: ${a.reasoning}`);
  });
  trace.completePhase('Resource Allocation', PHASE_DELAYS.allocation);

  // Phase 5 — Action Execution
  trace.startPhase('Action Execution', [
    'Executing action chain...',
    'Simulating API calls...',
    'Logging before/after states...',
  ]);
  const actions = await actionSimulatorAgent(crises, allocations, trace, city);
  trace.completePhase('Action Execution', PHASE_DELAYS.execution);

  // Phase 6 — Stakeholder Notifications
  trace.startPhase('Stakeholder Notifications', [
    'Drafting targeted messages...',
    'Simulating delivery...',
  ]);
  await delay(PHASE_DELAYS.notify);
  const messages = stakeholderAgent(crises, actions, city);
  messages.forEach((m) => trace.log(`${m.audience}: ${m.subject} → ${m.status}`));
  trace.completePhase('Stakeholder Notifications', PHASE_DELAYS.notify);

  // Phase 7 — False Alarm Correction
  trace.startPhase('False Alarm Correction', [
    'Reviewing classification accuracy...',
    'Issuing retraction if needed...',
  ]);
  await delay(PHASE_DELAYS.correction);
  if (city === 'karachi') {
    trace.log('khi-c1 initial alert scope overstated (city-wide flood)');
    trace.log('Field report khi-f1 (0.94): breach limited to Chakiwara only');
    trace.log('Retraction SMS drafted → SENT → delivered');
    trace.log('Classification refined: "general flood" → "localised riverbank breach"');
  } else {
    trace.log('isb-c1 initial classification: road collapse');
    trace.log('Field report isb-f1 (0.93): sinkhole caused by burst water main');
    trace.log('Correction issued: "road collapse" → "sinkhole/water main failure"');
  }
  trace.completePhase('False Alarm Correction', PHASE_DELAYS.correction);

  crises.forEach((c) => {
    useCrisisStore.getState().updateCrisis(c.id, {
      actions: c.actions,
      stakeholderMessages: c.stakeholderMessages,
    });
  });

  trace.finalise();
}

// ─── Legacy: full pipeline for backward compat ──────────────────────────────
export async function runCIROPipeline(city: City) {
  await runSimulation(city);
  await runAIDispatch(city);
}
