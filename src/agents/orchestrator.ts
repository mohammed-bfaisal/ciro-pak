import { useTraceStore, waitForGate } from '../store/traceStore';
import { useSignalStore } from '../store/signalStore';
import { useCrisisStore } from '../store/crisisStore';
import { useResourceStore } from '../store/resourceStore';
import { signalFusionAgent } from './signalFusion';
import { crisisDetectionAgent } from './crisisDetector';
import { resourceAllocationAgent } from './resourceAllocator';
import { actionSimulatorAgent } from './actionSimulator';
import { stakeholderAgent } from './stakeholderNotifier';
import { fetchWeather } from '../api/weather';
import { SCENARIO_REGISTRY } from '../data/mock';
import type { City } from '../types';

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

export async function runCIROPipeline(city: City) {
  const trace = useTraceStore.getState();
  const signals = useSignalStore.getState();
  const crisisStore = useCrisisStore.getState();
  const resourceStore = useResourceStore.getState();

  const scenario = SCENARIO_REGISTRY[city];

  signals.reset();
  crisisStore.reset();
  resourceStore.reset();
  trace.reset();

  trace.startSession(city);

  // ═══ PHASE 1 — Signal Ingestion ═══
  trace.startPhase('Signal Ingestion', [
    `Loading ${city} social posts...`,
    `Loading ${city} field reports...`,
    `Fetching OpenWeatherMap — ${city}...`,
    `Loading ${city} traffic data...`,
  ]);

  const rawSignals = scenario.signals;
  const weather = await fetchWeather(city);
  const allSignals = [...rawSignals, weather];
  signals.setRaw(allSignals);

  for (const signal of allSignals) {
    await delay(600);
    useSignalStore.getState().addSignal(signal);
    trace.log(`Ingested: ${signal.source} — "${signal.content.slice(0, 60)}..."`);
  }
  trace.completePhase('Signal Ingestion', PHASE_DELAYS.ingestion);
  await waitForGate(1);

  // ═══ PHASE 2 — Signal Fusion ═══
  trace.startPhase('Signal Fusion', [
    'Scoring credibility per source...',
    'Detecting conflicts...',
    'Applying corroboration bonuses...',
  ]);
  await delay(PHASE_DELAYS.fusion);

  const fusedSignals = signalFusionAgent(allSignals, city);
  useSignalStore.getState().setFused(fusedSignals);

  fusedSignals.forEach((s) => {
    const flag = s.isFlagged ? ' ⚠ FLAGGED' : '';
    trace.log(`Scored ${s.id} (${s.source}): credibility ${s.credibilityScore.toFixed(2)}${flag}`);
  });
  trace.completePhase('Signal Fusion', PHASE_DELAYS.fusion);
  await waitForGate(2);

  // ═══ PHASE 3 — Crisis Detection ═══
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
      `Crisis detected: ${c.type.toUpperCase()} — ${c.location.label} — ${Math.round(c.confidenceScore * 100)}% confidence — ${c.severity.toUpperCase()}`
    );
  });
  trace.completePhase('Crisis Detection', PHASE_DELAYS.detection);
  await waitForGate(3);

  // ═══ PHASE 4 — Resource Allocation ═══
  trace.startPhase('Resource Allocation', [
    'Loading available resources...',
    'Computing travel times...',
    'Solving allocation constraints...',
  ]);
  await delay(PHASE_DELAYS.allocation);

  const resources = scenario.resources;
  useResourceStore.getState().setResources(resources);

  const allocations = resourceAllocationAgent(crises, resources);
  allocations.forEach((a) => {
    useResourceStore.getState().assignResource(a.resourceId, a.crisisId);
    trace.log(`Assigned ${a.resourceId} → Crisis ${a.crisisId}: ${a.reasoning}`);
  });
  trace.completePhase('Resource Allocation', PHASE_DELAYS.allocation);
  await waitForGate(4);

  // ═══ PHASE 5 — Action Execution ═══
  trace.startPhase('Action Execution', [
    'Executing action chain...',
    'Simulating API calls...',
    'Logging before/after states...',
  ]);

  const actions = await actionSimulatorAgent(crises, allocations, trace, city);
  trace.completePhase('Action Execution', PHASE_DELAYS.execution);
  await waitForGate(5);

  // ═══ PHASE 6 — Stakeholder Notifications ═══
  trace.startPhase('Stakeholder Notifications', [
    'Drafting targeted messages...',
    'Simulating delivery...',
  ]);
  await delay(PHASE_DELAYS.notify);

  const messages = stakeholderAgent(crises, actions, city);
  messages.forEach((m) => {
    trace.log(`${m.audience}: ${m.subject} → ${m.status}`);
    const crisis = crises.find(() => true);
    if (crisis) {
      crisis.stakeholderMessages = [...(crisis.stakeholderMessages || []), m];
    }
  });
  trace.completePhase('Stakeholder Notifications', PHASE_DELAYS.notify);
  await waitForGate(6);

  // ═══ PHASE 7 — False Alarm Correction ═══
  trace.startPhase('False Alarm Correction', [
    'Reviewing classification accuracy...',
    'Checking field report vs initial alert...',
    'Issuing retraction if needed...',
  ]);
  await delay(PHASE_DELAYS.correction);

  // Each city scenario includes a correction note in its agent reasoning
  const primaryCrisis = crises[0];
  if (primaryCrisis) {
    trace.log(`${primaryCrisis.id} initial alert reviewed against field verification`);
    trace.log(`Verification status: ${primaryCrisis.verificationStatus.toUpperCase()}`);
    trace.log(`Confidence trajectory: ${primaryCrisis.confidenceHistory.map(h => `${h.t}→${(h.v * 100).toFixed(0)}%`).join(', ')}`);
  }
  if (crises.some(c => c.conflictingSignalIds.length > 0)) {
    trace.log('Conflicting signals flagged — partial retraction issued');
  } else {
    trace.log('No conflicting signals — classification confirmed accurate');
  }
  trace.completePhase('False Alarm Correction', PHASE_DELAYS.correction);

  trace.finalise();

  crises.forEach((c) => {
    useCrisisStore.getState().updateCrisis(c.id, {
      actions: c.actions,
      stakeholderMessages: c.stakeholderMessages,
    });
  });
}
