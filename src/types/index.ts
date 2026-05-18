export type SignalSource =
  | 'social' | 'weather' | 'traffic'
  | 'field_report' | 'sensor' | 'emergency_call';

export type CrisisType =
  | 'flood' | 'heatwave' | 'accident'
  | 'infrastructure' | 'power_outage'
  | 'protest' | 'disease_cluster' | 'unknown';

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type CrisisStatus = 'detecting' | 'active' | 'responding' | 'resolved' | 'false_alarm';
export type City =
  | 'karachi' | 'islamabad'
  | 'lahore' | 'rawalpindi' | 'faisalabad' | 'multan'
  | 'gujranwala' | 'sialkot' | 'bahawalpur' | 'sargodha'
  | 'peshawar' | 'abbottabad'
  | 'quetta' | 'gwadar'
  | 'hyderabad' | 'sukkur';

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface Signal {
  id: string;
  source: SignalSource;
  content: string;
  location: GeoPoint;
  timestamp: string;
  credibilityScore: number;
  urgencyScore: number;
  mentionVelocity?: number;
  isFlagged: boolean;
  conflictsWith?: string[];
  rawData: Record<string, unknown>;
}

export interface Crisis {
  id: string;
  type: CrisisType;
  title: string;
  location: GeoPoint & { affectedRadiusKm: number };
  severity: Severity;
  confidenceScore: number;
  confidenceHistory: { t: string; v: number }[];
  status: CrisisStatus;
  detectedAt: string;
  estimatedDuration: string;
  affectedPopulation: number;
  spreadRisk: 'contained' | 'expanding' | 'unknown';
  signalIds: string[];
  conflictingSignalIds: string[];
  verificationStatus: 'unverified' | 'verified' | 'retracted';
  agentReasoning: string;
  actions: Action[];
  stakeholderMessages: StakeholderMessage[];
  city: City;
}

export interface Resource {
  id: string;
  type: 'ambulance' | 'police_unit' | 'rescue_team' | 'fire_truck'
      | 'medical_outreach' | 'water_tanker' | 'drone';
  label: string;
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'returning';
  location: GeoPoint;
  assignedCrisisId: string | null;
  etaMinutes?: number;
  capacity: number;
  currentLoad: number;
  currentPosition: GeoPoint;
  targetPosition?: GeoPoint;
  movementProgress: number;
  routeCoordinates?: [number, number][]; // [lng, lat] pairs — actual road path
  returnRouteCoordinates?: [number, number][];
  assignmentHistory?: { crisisId: string; assignedAt: string; clearedAt?: string }[];
  availabilityCooldownMinutes?: number;
  lastEtaMinutes?: number;
  bearing?: number;
}

export interface Action {
  id: string;
  crisisId: string;
  type: 'traffic_reroute' | 'emergency_dispatch' | 'public_alert'
      | 'hospital_notify' | 'utility_escalate'
      | 'alert_retraction' | 'resource_realloc';
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'recovered';
  executedAt?: string;
  result?: string;
  costPKR: number;
  latencyMs: number;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  sideEffects?: string[];
  trace: TraceStep[];
}

export interface TraceStep {
  step: number;
  phase: string;
  observation: string;
  inference: string;
  decision: string;
  toolCalled?: string;
  toolResult?: string;
  execution?: string;
  timestamp: string;
}

export interface AgentTraceEvent {
  id: string;
  phase: string;
  observation: string;
  inference: string;
  decision: string;
  execution: string;
  timestamp: string;
}

export interface SignalCluster {
  id: string;
  city: City;
  signalIds: string[];
  location: GeoPoint;
  confidenceScore: number;
  dominantType: CrisisType;
  contradictionLevel: number;
}

export interface AllocationDecision {
  resourceId: string;
  crisisId: string;
  score: number;
  etaMinutes: number;
  reasoning: string;
}

export interface ImpactSnapshot {
  actionId: string;
  crisisId: string;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  sideEffects: string[];
}

export interface GameScore {
  handledIncidents: number;
  missedIncidents: number;
  averageResponseMinutes: number;
  publicTrust: number;
  resourceEfficiency: number;
  totalCostPKR: number;
}

export interface IncidentRuntime {
  crisisId: string;
  revealedAtMinute: number;
  deadlineMinute: number;
  requiredResourceTypes: Resource['type'][];
  status: 'queued' | 'active' | 'responding' | 'resolved' | 'missed' | 'false_alarm';
}

export interface DispatchSession {
  id: string;
  city: City;
  elapsedMinutes: number;
  speed: 1 | 2 | 4;
  status: 'idle' | 'running' | 'paused' | 'complete';
  score: GameScore;
}

export interface StakeholderMessage {
  audience: 'public' | 'emergency_services' | 'hospitals'
          | 'utility_company' | 'transport_authority' | 'media';
  channel: 'sms' | 'whatsapp' | 'email' | 'dashboard';
  subject: string;
  body: string;
  sentAt: string;
  status: 'draft' | 'sent' | 'delivered';
  isRetraction: boolean;
}

export interface WorkplanPhase {
  name: string;
  tasks: string[];
  status: 'pending' | 'running' | 'complete' | 'failed';
  durationMs?: number;
  logs: string[];
}

export interface Workplan {
  sessionId: string;
  city: City;
  startedAt: string;
  completedAt?: string;
  phases: WorkplanPhase[];
  summary: {
    crisisesDetected: number;
    actionsExecuted: number;
    actionsRecovered: number;
    falseAlarms: number;
    totalCostPKR: number;
    totalLatencyMs: number;
  };
}

export interface ResourceAllocation {
  resourceId: string;
  crisisId: string;
  reasoning: string;
}
