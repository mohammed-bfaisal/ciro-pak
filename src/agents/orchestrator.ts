import { useTraceStore } from '../store/traceStore';
import { useSignalStore } from '../store/signalStore';
import { useCrisisStore } from '../store/crisisStore';
import { useResourceStore } from '../store/resourceStore';
import { useSessionStore } from '../store/sessionStore';
import { getApiClientOptionsForSettings, useSettingsStore } from '../store/settingsStore';
import { signalFusionAgent } from './signalFusion';
import { crisisDetectionAgent } from './crisisDetector';
import { resourceAllocationAgent } from './resourceAllocator';
import { actionSimulatorAgent } from './actionSimulator';
import { stakeholderAgent } from './stakeholderNotifier';
import { chatWithOpenRouter } from '../api/openRouter';
import { fetchWeather } from '../api/weather';
import { haversineDistance } from '../utils/geo';
import { fetchRoute } from '../api/routing';
import type { AgentTraceEvent, City, Crisis, ImpactSnapshot, Resource, Signal } from '../types';
import { getResources, getSignals } from '../data/cityData';
import { buildDispatchBriefingPrompt, OPENROUTER_DISPATCH_SYSTEM_PROMPT } from './openRouterPrompts';

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
  return getSignals(city);
}

function loadResources(city: City): Resource[] {
  return getResources(city);
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
  const settings = useSettingsStore.getState();
  const weather = settings.enableWeatherUpdates
    ? await fetchWeather(city, getApiClientOptionsForSettings())
    : null;
  const allSignals = weather ? [...rawSignals, weather] : rawSignals;
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
  useTraceStore.setState({ isRunning: true });
  const trace = useTraceStore.getState();
  const crises = useCrisisStore.getState().crises;
  const existingResources = useResourceStore.getState().resources;

  if (crises.length === 0) {
    trace.log('⚠ No active crises — run SIMULATE first');
    useTraceStore.setState({ isRunning: false });
    return;
  }

  const resources = existingResources.length > 0
    ? existingResources
    : loadResources(city);

  if (existingResources.length === 0) {
    useResourceStore.getState().setResources(resources);
  }

  await addOpenRouterDispatchBriefing(city, crises, resources);

  // Phase 4 — Resource Allocation
  trace.startPhase('Resource Allocation', [
    'Loading available resources...',
    'Computing travel times...',
    'Solving allocation constraints...',
  ]);
  await delay(PHASE_DELAYS.allocation);

  const allocations = resourceAllocationAgent(crises, resources);
  const allocationTraceEvents: AgentTraceEvent[] = allocations.map((allocation) => {
    const crisis = crises.find((candidate) => candidate.id === allocation.crisisId);
    const unit = resources.find((candidate) => candidate.id === allocation.resourceId);
    return {
      id: `alloc-${allocation.resourceId}-${allocation.crisisId}-${Date.now()}`,
      phase: 'Resource Allocation',
      observation: `${unit?.label ?? allocation.resourceId} is available for ${crisis?.title ?? allocation.crisisId}.`,
      inference: `Score ${allocation.score} from type match, severity, confidence, population, travel time, and availability.`,
      decision: allocation.reasoning,
      execution: `Queued route lookup and dispatch movement with ETA ${allocation.etaMinutes} minutes.`,
      timestamp: new Date().toISOString(),
    };
  });
  useSessionStore.getState().addTraceEvents(allocationTraceEvents);
  allocations.forEach((allocation) => {
    trace.log(`AI score ${allocation.score}: ${allocation.reasoning}; ${allocation.tradeoff}`);
  });

  // Fetch real road routes for all allocations in parallel
  const routePromises = allocations.map(async (a) => {
    const crisis = crises.find((c) => c.id === a.crisisId);
    const unit = resources.find((r) => r.id === a.resourceId);
    if (!crisis || !unit) return null;
    const fromLat = unit.currentPosition?.lat ?? unit.location.lat;
    const fromLng = unit.currentPosition?.lng ?? unit.location.lng;
    const routeResult = await fetchRoute(
      fromLng,
      fromLat,
      crisis.location.lng,
      crisis.location.lat,
      getApiClientOptionsForSettings(),
    );
    const distKm = haversineDistance(fromLat, fromLng, crisis.location.lat, crisis.location.lng);
    const etaSeconds = routeResult?.etaSeconds ?? Math.max(a.etaMinutes * 60, Math.round((distKm / 30) * 3600));
    return { a, crisis, etaSeconds, routeCoordinates: routeResult?.coords, routeResult };
  });
  const routeResults = await Promise.all(routePromises);

  routeResults.forEach((r) => {
    if (!r) return;
    useResourceStore.getState().dispatchUnit(r.a.resourceId, r.a.crisisId, r.crisis.location, r.etaSeconds, r.routeCoordinates, r.routeResult ?? undefined);
    useCrisisStore.getState().updateCrisis(r.a.crisisId, { status: 'responding' });
    trace.log(`Dispatched ${r.a.resourceId} → ${r.a.crisisId}: ${r.a.reasoning}`);
  });
  trace.completePhase('Resource Allocation', PHASE_DELAYS.allocation);

  // Phase 5 — Action Execution
  trace.startPhase('Action Execution', [
    'Executing action chain...',
    'Simulating API calls...',
    'Logging before/after states...',
  ]);
  const actions = await actionSimulatorAgent(crises, allocations, trace, city);
  const snapshots: ImpactSnapshot[] = actions.map((action) => ({
    actionId: action.id,
    crisisId: action.crisisId,
    beforeState: action.beforeState,
    afterState: action.afterState,
    sideEffects: action.sideEffects ?? [],
  }));
  const actionTraceEvents: AgentTraceEvent[] = actions.flatMap((action) =>
    action.trace.map((step) => ({
      id: `action-${action.id}-${step.step}-${Date.now()}`,
      phase: `Action: ${action.title}`,
      observation: step.observation,
      inference: step.inference,
      decision: step.decision,
      execution: step.execution ?? step.toolResult ?? `${action.status} state applied.`,
      timestamp: step.timestamp,
    }))
  );
  useSessionStore.getState().addImpactSnapshots(snapshots);
  useSessionStore.getState().addTraceEvents(actionTraceEvents);
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

async function addOpenRouterDispatchBriefing(city: City, crises: Crisis[], resources: Resource[]) {
  const trace = useTraceStore.getState();
  try {
    const briefing = await chatWithOpenRouter({
      systemPrompt: OPENROUTER_DISPATCH_SYSTEM_PROMPT,
      prompt: buildDispatchBriefingPrompt(city, crises, resources),
      maxTokens: 160,
      temperature: 0.2,
    }, getApiClientOptionsForSettings());
    const providerLabel = briefing.provider === 'openrouter'
      ? 'OpenRouter dispatch briefing'
      : `OpenRouter fallback briefing (${briefing.fallbackReason ?? 'provider_unavailable'})`;
    const content = briefing.content.replace(/\s+/g, ' ').trim();
    trace.log(`${providerLabel}: ${content}`);
    useSessionStore.getState().addTraceEvents([
      {
        id: `openrouter-briefing-${Date.now()}`,
        phase: 'AI Dispatch Briefing',
        observation: `${crises.length} active crises and ${resources.filter((resource) => resource.status === 'available').length} available units were summarised for hosted AI review.`,
        inference: content,
        decision: 'Use the hosted briefing as advisory context while preserving deterministic route and resource allocation constraints.',
        execution: `Provider ${briefing.provider}; model ${briefing.model}.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    trace.log(`OpenRouter dispatch briefing unavailable: ${error instanceof Error ? error.message : 'request failed'}`);
  }
}

// ─── Legacy: full pipeline for backward compat ──────────────────────────────
export async function runCIROPipeline(city: City) {
  await runSimulation(city);
  await runAIDispatch(city);
}
