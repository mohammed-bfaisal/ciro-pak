import type { AgentTraceEvent, City, Crisis, DispatchSession, GameScore, IncidentRuntime, Signal } from '../types';
import type { CityData } from '../data/cityData';

const SIGNALS_PER_SIM_MINUTE = 1;
const INCIDENT_SIGNAL_THRESHOLD = 3;

export interface LiveSimulationState {
  session: DispatchSession;
  elapsedMinutes: number;
  nextSignalIndex: number;
  revealedSignalIds: string[];
  revealedCrisisIds: string[];
  incidents: IncidentRuntime[];
  score: GameScore;
}

export interface LiveSimulationResult {
  state: LiveSimulationState;
  newSignals: Signal[];
  newCrises: Crisis[];
  traceEvents: AgentTraceEvent[];
}

export function createLiveSimulation(city: City, cityData: CityData): LiveSimulationState {
  const sessionId = `dispatch-${city}-${Date.now()}`;
  const score = createInitialScore();

  return {
    session: {
      id: sessionId,
      city,
      elapsedMinutes: 0,
      speed: 1,
      status: 'running',
      score,
    },
    elapsedMinutes: 0,
    nextSignalIndex: 0,
    revealedSignalIds: [],
    revealedCrisisIds: [],
    incidents: cityData.crises.map((crisis, index) => ({
      crisisId: crisis.id,
      revealedAtMinute: 3 + index * 4,
      deadlineMinute: 24 + index * 10,
      requiredResourceTypes: requiredResourcesFor(crisis),
      status: 'queued',
    })),
    score,
  };
}

export function advanceLiveSimulation(
  state: LiveSimulationState,
  cityData: CityData,
  deltaMinutes: number,
): LiveSimulationResult {
  const elapsedMinutes = Number((state.elapsedMinutes + deltaMinutes).toFixed(2));
  const targetSignalCount = Math.min(
    cityData.signals.length,
    Math.floor(elapsedMinutes * SIGNALS_PER_SIM_MINUTE),
  );
  const newSignals = cityData.signals.slice(state.nextSignalIndex, targetSignalCount);
  const revealedSignalIds = [
    ...state.revealedSignalIds,
    ...newSignals.map((signal) => signal.id),
  ];

  const activated: Crisis[] = [];
  const traceEvents: AgentTraceEvent[] = [];
  const incidents = state.incidents.map((incident) => {
    if (incident.status !== 'queued') return incident;
    const crisis = cityData.crises.find((candidate) => candidate.id === incident.crisisId);
    if (!crisis) return incident;
    const supportingSignalCount = crisis.signalIds.filter((id) => revealedSignalIds.includes(id)).length;
    const canReveal = elapsedMinutes >= incident.revealedAtMinute || supportingSignalCount >= INCIDENT_SIGNAL_THRESHOLD;

    if (!canReveal) return incident;

    activated.push(crisis);
    traceEvents.push(traceForActivation(crisis, supportingSignalCount));
    return { ...incident, status: 'active' as const, revealedAtMinute: elapsedMinutes };
  });

  const missedState = missExpiredIncidents({
    ...state,
    elapsedMinutes,
    nextSignalIndex: targetSignalCount,
    revealedSignalIds,
    revealedCrisisIds: [
      ...state.revealedCrisisIds,
      ...activated.map((crisis) => crisis.id),
    ],
    incidents,
  });

  return {
    state: {
      ...missedState,
      session: {
        ...missedState.session,
        elapsedMinutes,
        score: missedState.score,
      },
    },
    newSignals,
    newCrises: activated,
    traceEvents,
  };
}

export function resolveIncident(
  state: LiveSimulationState,
  crisisId: string,
  responseMinutes: number,
): LiveSimulationState {
  const incidents = state.incidents.map((incident) =>
    incident.crisisId === crisisId && (incident.status === 'active' || incident.status === 'responding')
      ? { ...incident, status: 'resolved' as const }
      : incident
  );
  const handledIncidents = state.score.handledIncidents + 1;
  const averageResponseMinutes = Number(
    (((state.score.averageResponseMinutes * state.score.handledIncidents) + responseMinutes) / handledIncidents).toFixed(1)
  );
  const score = {
    ...state.score,
    handledIncidents,
    averageResponseMinutes,
    publicTrust: Math.min(100, state.score.publicTrust + 4),
    resourceEfficiency: Math.min(100, state.score.resourceEfficiency + 2),
  };
  return syncScore({ ...state, incidents, score });
}

export function missExpiredIncidents(state: LiveSimulationState): LiveSimulationState {
  let missed = 0;
  const incidents = state.incidents.map((incident) => {
    if ((incident.status === 'active' || incident.status === 'responding') && state.elapsedMinutes > incident.deadlineMinute) {
      missed += 1;
      return { ...incident, status: 'missed' as const };
    }
    return incident;
  });

  if (missed === 0) return state;

  const score = {
    ...state.score,
    missedIncidents: state.score.missedIncidents + missed,
    publicTrust: Math.max(0, state.score.publicTrust - missed * 8),
    resourceEfficiency: Math.max(0, state.score.resourceEfficiency - missed * 4),
  };
  return syncScore({ ...state, incidents, score });
}

function createInitialScore(): GameScore {
  return {
    handledIncidents: 0,
    missedIncidents: 0,
    averageResponseMinutes: 0,
    publicTrust: 72,
    resourceEfficiency: 70,
    totalCostPKR: 0,
  };
}

function syncScore(state: LiveSimulationState): LiveSimulationState {
  return {
    ...state,
    session: {
      ...state.session,
      score: state.score,
      elapsedMinutes: state.elapsedMinutes,
    },
  };
}

function requiredResourcesFor(crisis: Crisis): IncidentRuntime['requiredResourceTypes'] {
  if (crisis.type === 'flood') return ['rescue_team', 'police_unit', 'water_tanker'];
  if (crisis.type === 'heatwave' || crisis.type === 'disease_cluster') return ['ambulance', 'medical_outreach'];
  if (crisis.type === 'accident') return ['ambulance', 'police_unit', 'rescue_team'];
  if (crisis.type === 'protest') return ['police_unit', 'medical_outreach'];
  if (crisis.type === 'infrastructure' || crisis.type === 'power_outage') return ['rescue_team', 'fire_truck', 'drone'];
  return ['rescue_team', 'ambulance'];
}

function traceForActivation(crisis: Crisis, supportingSignalCount: number): AgentTraceEvent {
  return {
    id: `trace-${crisis.id}-${Date.now()}`,
    phase: 'Crisis Detection',
    observation: `${supportingSignalCount} supporting signals cluster around ${crisis.location.label}.`,
    inference: `${crisis.title} confidence is ${Math.round(crisis.confidenceScore * 100)}% with ${crisis.severity} severity.`,
    decision: `promote ${crisis.id} to active incident and queue dispatch decisions.`,
    execution: `Incident marker and registry row activated for ${crisis.title}.`,
    timestamp: new Date().toISOString(),
  };
}
