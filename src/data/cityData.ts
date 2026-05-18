import type { Action, City, Crisis, CrisisType, GeoPoint, Resource, Severity, Signal, StakeholderMessage } from '../types';
import { CITY_REGISTRY } from './cities';
import karachiSignals from './mock/karachi/signals.json';
import karachiResources from './mock/karachi/resources.json';
import islamabadSignals from './mock/islamabad/signals.json';
import islamabadResources from './mock/islamabad/resources.json';
import { getKarachiActions, getKarachiCrises, getKarachiMessages } from './mock/karachi/scenario';
import { getIslamabadActions, getIslamabadCrises, getIslamabadMessages } from './mock/islamabad/scenario';
import { getStationResources } from './stationResources';

export interface CityData {
  signals: Signal[];
  resources: Resource[];
  crises: Crisis[];
  actions: Action[];
  messages: StakeholderMessage[];
}

interface GeneratedScenarioSpec {
  prefix: string;
  primary: { title: string; type: CrisisType; severity: Severity; locationLabel: string };
  secondary: { title: string; type: CrisisType; severity: Severity; locationLabel: string };
  agencies: {
    rescue: string;
    police: string;
    ambulance: string;
    fire: string;
    support: string;
    drone: string;
    field: string;
    utility: string;
    hospital: string;
  };
  sensorKind: 'sensor' | 'emergency_call';
}

const GENERATED_SCENARIOS: Record<Exclude<City, 'karachi' | 'islamabad'>, GeneratedScenarioSpec> = {
  lahore: {
    prefix: 'lhr',
    primary: { title: 'Canal Road smog emergency', type: 'disease_cluster', severity: 'high', locationLabel: 'Canal Road, Lahore' },
    secondary: { title: 'Bhati Gate protest escalation', type: 'protest', severity: 'medium', locationLabel: 'Bhati Gate, Lahore' },
    agencies: agency('Rescue 1122 Lahore', 'Lahore Traffic Police', 'Mayo Hospital Ambulance', 'Lahore Fire Brigade', 'WASA Lahore Water Unit', 'Punjab Safe Cities Drone', 'PDMA Punjab Field Desk', 'WASA Lahore', 'Mayo Hospital'),
    sensorKind: 'sensor',
  },
  rawalpindi: {
    prefix: 'rwp',
    primary: { title: 'Nullah Lai flash flood', type: 'flood', severity: 'critical', locationLabel: 'Nullah Lai, Rawalpindi' },
    secondary: { title: 'Commercial Market gas rupture', type: 'infrastructure', severity: 'high', locationLabel: 'Commercial Market, Rawalpindi' },
    agencies: agency('Rescue 1122 Rawalpindi', 'Rawalpindi Traffic Police', 'Holy Family Ambulance', 'Rawalpindi Fire Brigade', 'SNGPL Emergency Crew', 'Safe City Rawalpindi Drone', 'PDMA Punjab Rawalpindi', 'SNGPL Rawalpindi', 'Holy Family Hospital'),
    sensorKind: 'emergency_call',
  },
  faisalabad: {
    prefix: 'fsd',
    primary: { title: 'D-Ground chemical spill', type: 'infrastructure', severity: 'critical', locationLabel: 'D-Ground, Faisalabad' },
    secondary: { title: 'Clock Tower heat power outage', type: 'heatwave', severity: 'high', locationLabel: 'Clock Tower, Faisalabad' },
    agencies: agency('Rescue 1122 Faisalabad', 'Faisalabad Traffic Police', 'Allied Hospital Ambulance', 'Faisalabad Fire Brigade', 'FESCO Emergency Van', 'Punjab Safe Cities Drone', 'EPA Faisalabad Field Unit', 'FESCO Faisalabad', 'Allied Hospital'),
    sensorKind: 'sensor',
  },
  multan: {
    prefix: 'mtn',
    primary: { title: 'Hussain Agahi extreme heatwave', type: 'heatwave', severity: 'critical', locationLabel: 'Hussain Agahi, Multan' },
    secondary: { title: 'Vehari Chowk underpass collapse', type: 'infrastructure', severity: 'high', locationLabel: 'Vehari Chowk, Multan' },
    agencies: agency('Rescue 1122 Multan', 'Multan Traffic Police', 'Nishtar Hospital Ambulance', 'Multan Fire Brigade', 'MEPCO Emergency Crew', 'Punjab Safe Cities Drone', 'PDMA South Punjab', 'MEPCO Multan', 'Nishtar Hospital'),
    sensorKind: 'emergency_call',
  },
  gujranwala: {
    prefix: 'gjw',
    primary: { title: 'Industrial estate factory fire', type: 'infrastructure', severity: 'critical', locationLabel: 'Gujranwala Industrial Estate' },
    secondary: { title: 'City water contamination alert', type: 'disease_cluster', severity: 'high', locationLabel: 'Satellite Town, Gujranwala' },
    agencies: agency('Rescue 1122 Gujranwala', 'Gujranwala Traffic Police', 'DHQ Gujranwala Ambulance', 'Gujranwala Fire Brigade', 'WASA Gujranwala Tanker', 'Punjab Safe Cities Drone', 'EPA Gujranwala Field Team', 'WASA Gujranwala', 'DHQ Gujranwala'),
    sensorKind: 'sensor',
  },
  sialkot: {
    prefix: 'skt',
    primary: { title: 'Narowal Road flash flood', type: 'flood', severity: 'high', locationLabel: 'Narowal Road, Sialkot' },
    secondary: { title: 'River Aik effluent discharge', type: 'infrastructure', severity: 'medium', locationLabel: 'River Aik, Sialkot' },
    agencies: agency('Rescue 1122 Sialkot', 'Sialkot Traffic Police', 'Allama Iqbal Hospital Ambulance', 'Sialkot Fire Brigade', 'Municipal Water Unit', 'Punjab Safe Cities Drone', 'EPA Sialkot Field Team', 'Municipal Corporation Sialkot', 'Allama Iqbal Memorial Hospital'),
    sensorKind: 'sensor',
  },
  bahawalpur: {
    prefix: 'bwp',
    primary: { title: 'Circular Road sandstorm pileup', type: 'accident', severity: 'high', locationLabel: 'Circular Road, Bahawalpur' },
    secondary: { title: 'Victoria Hospital capacity crisis', type: 'disease_cluster', severity: 'medium', locationLabel: 'Bahawal Victoria Hospital' },
    agencies: agency('Rescue 1122 Bahawalpur', 'Bahawalpur Traffic Police', 'BVH Ambulance', 'Bahawalpur Fire Brigade', 'Cholistan Relief Tanker', 'Punjab Safe Cities Drone', 'PDMA Bahawalpur', 'Cholistan Development Authority', 'Bahawal Victoria Hospital'),
    sensorKind: 'emergency_call',
  },
  sargodha: {
    prefix: 'sgd',
    primary: { title: 'Upper Jhelum Canal breach', type: 'flood', severity: 'high', locationLabel: 'Upper Jhelum Canal, Sargodha' },
    secondary: { title: 'Outskirts crop emergency', type: 'infrastructure', severity: 'medium', locationLabel: 'Sargodha Agricultural Belt' },
    agencies: agency('Rescue 1122 Sargodha', 'Sargodha Traffic Police', 'DHQ Sargodha Ambulance', 'Sargodha Fire Brigade', 'Irrigation Department Crew', 'Punjab Safe Cities Drone', 'Irrigation Sargodha Field Unit', 'Punjab Agriculture Department', 'DHQ Sargodha'),
    sensorKind: 'sensor',
  },
  peshawar: {
    prefix: 'pew',
    primary: { title: 'Qissa Khwani Bazaar crowd surge', type: 'protest', severity: 'high', locationLabel: 'Qissa Khwani Bazaar, Peshawar' },
    secondary: { title: 'Kabul River Ring Road flood', type: 'flood', severity: 'critical', locationLabel: 'Ring Road, Peshawar' },
    agencies: agency('Rescue 1122 KPK Peshawar', 'Peshawar Traffic Police', 'Lady Reading Ambulance', 'Peshawar Fire Brigade', 'KP-PDMA Relief Unit', 'KP Safe City Drone', 'KP-PDMA Field Desk', 'Peshawar Development Authority', 'Lady Reading Hospital'),
    sensorKind: 'emergency_call',
  },
  abbottabad: {
    prefix: 'abt',
    primary: { title: 'Mandian earthquake building damage', type: 'infrastructure', severity: 'critical', locationLabel: 'Mandian, Abbottabad' },
    secondary: { title: 'Karakoram Highway landslide', type: 'accident', severity: 'high', locationLabel: 'Karakoram Highway, Abbottabad' },
    agencies: agency('Rescue 1122 Abbottabad', 'Abbottabad Traffic Police', 'Ayub Medical Ambulance', 'Abbottabad Fire Brigade', 'ERRA Field Team', 'KP Recon Drone', 'ERRA Abbottabad Field Unit', 'NHA Abbottabad', 'Ayub Medical Complex'),
    sensorKind: 'sensor',
  },
  quetta: {
    prefix: 'qta',
    primary: { title: 'Sariab Road earthquake damage', type: 'infrastructure', severity: 'critical', locationLabel: 'Sariab Road, Quetta' },
    secondary: { title: 'N-25 winter storm closure', type: 'accident', severity: 'high', locationLabel: 'N-25 Highway, Quetta' },
    agencies: agency('Balochistan PDMA Rescue', 'Quetta Traffic Police', 'CMH Quetta Ambulance', 'Quetta Fire Brigade', 'Levies Relief Unit', 'Balochistan Recon Drone', 'PDMA Balochistan Field Desk', 'NHA Balochistan', 'CMH Quetta'),
    sensorKind: 'emergency_call',
  },
  gwadar: {
    prefix: 'gwd',
    primary: { title: 'Koh-e-Batil cyclone evacuation', type: 'flood', severity: 'critical', locationLabel: 'Koh-e-Batil, Gwadar' },
    secondary: { title: 'Gwadar tanker shortage', type: 'infrastructure', severity: 'high', locationLabel: 'Gwadar Port Road' },
    agencies: agency('Pakistan Coast Guards Rescue', 'Gwadar Traffic Police', 'GDA Hospital Ambulance', 'Gwadar Fire Brigade', 'GDA Water Tanker', 'Coastal Recon Drone', 'Balochistan PDMA Gwadar', 'Gwadar Development Authority', 'GDA Hospital'),
    sensorKind: 'sensor',
  },
  hyderabad: {
    prefix: 'hyd',
    primary: { title: 'Hatri industrial fire', type: 'infrastructure', severity: 'critical', locationLabel: 'Hatri SITE, Hyderabad' },
    secondary: { title: 'Qasimabad drainage failure', type: 'flood', severity: 'high', locationLabel: 'Qasimabad, Hyderabad' },
    agencies: agency('Rescue 1122 Sindh Hyderabad', 'Hyderabad Traffic Police', 'Liaquat University Ambulance', 'Hyderabad Fire Brigade', 'WASA Hyderabad Tanker', 'Sindh PDMA Drone', 'Sindh PDMA Hyderabad', 'WASA Hyderabad', 'Liaquat University Hospital'),
    sensorKind: 'emergency_call',
  },
  sukkur: {
    prefix: 'skr',
    primary: { title: 'Guddu Barrage flood surge', type: 'flood', severity: 'critical', locationLabel: 'Guddu Barrage, Sukkur' },
    secondary: { title: 'Sukkur heat hospital capacity crisis', type: 'heatwave', severity: 'high', locationLabel: 'Civil Hospital Sukkur' },
    agencies: agency('Rescue 1122 Sindh Sukkur', 'Sukkur Traffic Police', 'Civil Hospital Ambulance', 'Sukkur Fire Brigade', 'SEPCO Emergency Crew', 'Sindh PDMA Drone', 'Sindh Irrigation Field Unit', 'SEPCO Sukkur', 'Civil Hospital Sukkur'),
    sensorKind: 'sensor',
  },
};

export function getCityData(city: City): CityData {
  if (city === 'karachi') {
    return existingCityData(city, karachiSignals as Signal[], karachiResources as Resource[], getKarachiCrises(), getKarachiActions(), getKarachiMessages());
  }

  if (city === 'islamabad') {
    return existingCityData(city, islamabadSignals as Signal[], islamabadResources as Resource[], getIslamabadCrises(), getIslamabadActions(), getIslamabadMessages());
  }

  return generateCityData(city, GENERATED_SCENARIOS[city]);
}

export function getSignals(city: City): Signal[] {
  return getCityData(city).signals;
}

export function getResources(city: City): Resource[] {
  return getCityData(city).resources;
}

export function getCrises(city: City): Crisis[] {
  return getCityData(city).crises;
}

export function getActions(city: City): Action[] {
  return getCityData(city).actions;
}

export function getMessages(city: City): StakeholderMessage[] {
  return getCityData(city).messages;
}

function existingCityData(
  city: City,
  signals: Signal[],
  resources: Resource[],
  crises: Crisis[],
  actions: Action[],
  messages: StakeholderMessage[],
): CityData {
  const completeSignals = ensureChallengeSources(city, signals);

  return {
    signals: completeSignals,
    resources: normalizeResources(getStationResources(city).length > 0 ? getStationResources(city) : resources),
    actions,
    messages,
    crises: crises.map((crisis) => {
      const crisisMessages = messages.filter((message) =>
        message.isRetraction ||
        message.subject.toLowerCase().includes(crisis.type) ||
        crisis.stakeholderMessages.some((m) => m.subject === message.subject)
      );

      return {
        ...crisis,
        city,
        actions: actions.filter((action) => action.crisisId === crisis.id),
        stakeholderMessages: crisisMessages.length >= 2 ? crisisMessages : messages.slice(0, 2),
      };
    }),
  };
}

function ensureChallengeSources(city: City, signals: Signal[]): Signal[] {
  const hasEmergencySource = signals.some((signalItem) => signalItem.source === 'sensor' || signalItem.source === 'emergency_call');
  if (hasEmergencySource) return signals;

  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;
  return [
    ...signals,
    {
      id: `${city}-e1`,
      source: 'emergency_call',
      content: `${metadata.label} emergency call center reports a burst of related calls near the active incident zone.`,
      location: { lat, lng, label: `${metadata.label} Emergency Call Center` },
      timestamp: '2026-05-20T08:50:00Z',
      credibilityScore: 0.88,
      urgencyScore: 0.86,
      mentionVelocity: 14,
      isFlagged: false,
      rawData: { source: 'mock_1122_call_frequency', calls_15m: 14 },
    },
  ];
}

function generateCityData(city: Exclude<City, 'karachi' | 'islamabad'>, spec: GeneratedScenarioSpec): CityData {
  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;
  const c1Location = offsetPoint(metadata.label, spec.primary.locationLabel, lat, lng, 0.018, -0.012);
  const c2Location = offsetPoint(metadata.label, spec.secondary.locationLabel, lat, lng, -0.016, 0.014);
  const signals = makeSignals(city, spec, c1Location, c2Location);
  const actions = [
    ...makeActions(spec, `${spec.prefix}-c1`, spec.primary.title, 'traffic_reroute'),
    ...makeActions(spec, `${spec.prefix}-c2`, spec.secondary.title, 'hospital_notify'),
  ];
  const messages = [
    ...makeMessages(spec, spec.primary.title, spec.primary.locationLabel, false),
    ...makeMessages(spec, spec.secondary.title, spec.secondary.locationLabel, true),
  ];
  const crises = [
    makeCrisis(city, spec, 'primary', c1Location, actions, messages, signals),
    makeCrisis(city, spec, 'secondary', c2Location, actions, messages, signals),
  ];

  return {
    signals,
    resources: normalizeResources(getStationResources(city)),
    crises,
    actions,
    messages,
  };
}

function makeSignals(
  city: City,
  spec: GeneratedScenarioSpec,
  c1Location: GeoPoint,
  c2Location: GeoPoint,
): Signal[] {
  const label = CITY_REGISTRY[city].label;
  const p = spec.prefix;
  return [
    signal(`${p}-s1`, 'social', `${spec.primary.title} reported near ${spec.primary.locationLabel}; people asking for emergency help.`, c1Location, 0.66, 0.92, { platform: 'Twitter/X', likes: 84, retweets: 41 }, 18),
    signal(`${p}-s2`, 'social', `Local residents say ${spec.primary.locationLabel} is blocked and response units are needed now.`, c1Location, 0.72, 0.88, { platform: 'Facebook', shares: 37 }, 13),
    signal(`${p}-s3`, 'social', `Contradictory post claims there is no major incident in ${label}; low engagement and stale timestamp.`, c1Location, 0.18, 0.08, { platform: 'TikTok', likes: 1 }, 0, true, [`${p}-f1`]),
    signal(`${p}-w1`, 'weather', `${label} weather feed shows conditions that can worsen ${spec.primary.title}.`, c1Location, 0.85, 0.7, { source: 'OpenWeatherMap mock', city }),
    signal(`${p}-t1`, 'traffic', `Traffic speed near ${spec.primary.locationLabel} dropped to 6km/h against normal 45km/h.`, c1Location, 0.82, 0.77, { source: 'traffic_api', speed_kmh: 6, normal_speed: 45 }),
    signal(`${p}-f1`, 'field_report', `${spec.agencies.field}: verified ${spec.primary.title}; affected radius expanding and public access should be restricted.`, c1Location, 0.94, 0.96, { reporter: spec.agencies.field, verified: true }),
    signal(`${p}-f2`, 'field_report', `${spec.agencies.utility}: ${spec.secondary.title} confirmed at ${spec.secondary.locationLabel}; utility escalation requested.`, c2Location, 0.9, 0.84, { reporter: spec.agencies.utility, verified: true }),
    signal(`${p}-e1`, spec.sensorKind, `${spec.sensorKind === 'sensor' ? 'Sensor' : 'Emergency call'} burst around ${spec.secondary.locationLabel}; multiple reports in 15 minutes.`, c2Location, 0.86, 0.89, { count: 11, window_minutes: 15 }),
  ];
}

function makeCrisis(
  city: City,
  spec: GeneratedScenarioSpec,
  kind: 'primary' | 'secondary',
  location: GeoPoint,
  actions: Action[],
  messages: StakeholderMessage[],
  signals: Signal[],
): Crisis {
  const scenario = spec[kind];
  const id = `${spec.prefix}-${kind === 'primary' ? 'c1' : 'c2'}`;
  const signalIds = kind === 'primary'
    ? [`${spec.prefix}-s1`, `${spec.prefix}-s2`, `${spec.prefix}-w1`, `${spec.prefix}-t1`, `${spec.prefix}-f1`]
    : [`${spec.prefix}-s3`, `${spec.prefix}-w1`, `${spec.prefix}-f2`, `${spec.prefix}-e1`];
  const crisisSignals = signals.filter((s) => signalIds.includes(s.id));
  const confidence = average(crisisSignals.map((s) => s.credibilityScore));

  return {
    id,
    type: scenario.type,
    title: scenario.title,
    location: { ...location, affectedRadiusKm: kind === 'primary' ? 3.2 : 1.8 },
    severity: scenario.severity,
    confidenceScore: Number(confidence.toFixed(2)),
    confidenceHistory: [
      { t: '00:05', v: Math.max(0.25, confidence - 0.22) },
      { t: '00:12', v: confidence },
    ],
    status: 'active',
    detectedAt: '2026-05-20T09:00:00Z',
    estimatedDuration: kind === 'primary' ? '2-4 hours' : '1-3 hours',
    affectedPopulation: Math.round(CITY_REGISTRY[city].population * (kind === 'primary' ? 0.018 : 0.008)),
    spreadRisk: scenario.severity === 'critical' ? 'expanding' : 'contained',
    signalIds,
    conflictingSignalIds: kind === 'primary' ? [`${spec.prefix}-s3`] : [],
    verificationStatus: kind === 'primary' ? 'verified' : 'unverified',
    agentReasoning: [
      'Signal Fusion Analysis:',
      `- ${spec.prefix}-f1 / ${spec.prefix}-f2 field evidence is high credibility and location-specific.`,
      `- Social chatter around ${scenario.locationLabel} is corroborated by traffic/weather or emergency-call telemetry.`,
      `- Contradictory low-engagement social evidence is retained for false-alarm review, not discarded.`,
      `Severity: ${scenario.severity.toUpperCase()} - allocation should prioritize type match, travel time, and affected population.`,
    ].join('\n'),
    actions: actions.filter((action) => action.crisisId === id),
    stakeholderMessages: messages.filter((message) => message.subject.includes(scenario.title) || message.body.includes(scenario.locationLabel)),
    city,
  };
}

function makeActions(
  spec: GeneratedScenarioSpec,
  crisisId: string,
  title: string,
  firstType: Action['type'],
): Action[] {
  return [
    action(`${crisisId}-a1`, crisisId, firstType, `Stabilize ${title}`, 'Route responders, publish operational status, and reduce immediate public risk.', 'completed', false),
    action(`${crisisId}-a2`, crisisId, 'emergency_dispatch', `Dispatch units for ${title}`, 'Send matched units with ETA and command notes.', 'completed', false),
    action(`${crisisId}-a3`, crisisId, 'public_alert', `Public alert for ${title}`, 'Send location-specific guidance and avoid broad panic.', 'recovered', true, spec.agencies.utility),
  ];
}

function makeMessages(
  spec: GeneratedScenarioSpec,
  title: string,
  locationLabel: string,
  includeRetraction: boolean,
): StakeholderMessage[] {
  const now = '2026-05-20T09:10:00Z';
  const base = [
    message('public', 'sms', `${title} public advisory`, `${locationLabel}: avoid the area, follow official routes, and wait for verified updates.`, now, false),
    message('emergency_services', 'dashboard', `${title} response brief`, `${spec.agencies.rescue} and ${spec.agencies.police} coordinate at ${locationLabel}.`, now, false),
    message('hospitals', 'email', `${title} hospital readiness`, `${spec.agencies.hospital}: prepare triage capacity and receive ETA updates.`, now, false),
    message('utility_company', 'email', `${title} utility escalation`, `${spec.agencies.utility}: confirm field crew and restoration estimate for ${locationLabel}.`, now, false),
  ];

  if (!includeRetraction) return base;
  return [
    ...base,
    message('media', 'dashboard', `${title} correction notice`, `${locationLabel}: previous broad alert narrowed after field verification; update dashboards and public copy.`, now, true),
  ];
}

function signal(
  id: string,
  source: Signal['source'],
  content: string,
  location: GeoPoint,
  credibilityScore: number,
  urgencyScore: number,
  rawData: Record<string, unknown>,
  mentionVelocity?: number,
  isFlagged = false,
  conflictsWith?: string[],
): Signal {
  return {
    id,
    source,
    content,
    location,
    timestamp: '2026-05-20T08:45:00Z',
    credibilityScore,
    urgencyScore,
    mentionVelocity,
    isFlagged,
    conflictsWith,
    rawData,
  };
}

function action(
  id: string,
  crisisId: string,
  type: Action['type'],
  title: string,
  description: string,
  status: Action['status'],
  recovered: boolean,
  toolOwner = 'city_api',
): Action {
  return {
    id,
    crisisId,
    type,
    title,
    description,
    status,
    executedAt: '2026-05-20T09:12:00Z',
    result: recovered ? 'Initial API call failed; cached fallback recovered the action.' : 'Action simulated successfully.',
    costPKR: recovered ? 4_500 : 2_100,
    latencyMs: recovered ? 1800 : 620,
    beforeState: { congestion: 'critical', resourcesOnScene: 0, publicAlertsOut: 0 },
    afterState: { congestion: recovered ? 'moderate' : 'reduced', resourcesOnScene: type === 'emergency_dispatch' ? 2 : 0, publicAlertsOut: type === 'public_alert' ? 18_000 : 0 },
    sideEffects: recovered ? ['Fallback source used', 'Post-incident review required'] : ['No adverse side effects projected'],
    trace: [
      {
        step: 1,
        phase: 'Observe',
        observation: `${title} requires coordinated response.`,
        inference: 'The action can reduce risk if routed through verified channels.',
        decision: `Execute ${type} with operator-visible logging.`,
        execution: recovered ? `Primary ${toolOwner} call failed; fallback executed.` : `${toolOwner} accepted the simulated request.`,
        toolCalled: toolOwner,
        toolResult: recovered ? 'HTTP 503 -> cached fallback' : 'OK',
        timestamp: '2026-05-20T09:12:00Z',
      },
    ],
  };
}

function message(
  audience: StakeholderMessage['audience'],
  channel: StakeholderMessage['channel'],
  subject: string,
  body: string,
  sentAt: string,
  isRetraction: boolean,
): StakeholderMessage {
  return {
    audience,
    channel,
    subject,
    body,
    sentAt,
    status: isRetraction ? 'sent' : 'delivered',
    isRetraction,
  };
}

function normalizeResources(resources: Resource[]): Resource[] {
  return resources.map((resourceItem) => ({
    ...resourceItem,
    currentPosition: resourceItem.currentPosition ?? resourceItem.location,
    movementProgress: resourceItem.movementProgress ?? 0,
    assignmentHistory: resourceItem.assignmentHistory ?? [],
  }));
}

function offsetPoint(cityLabel: string, label: string, lat: number, lng: number, dLat: number, dLng: number): GeoPoint {
  return {
    lat: Number((lat + dLat).toFixed(4)),
    lng: Number((lng + dLng).toFixed(4)),
    label: `${label}, ${cityLabel}`,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function agency(
  rescue: string,
  police: string,
  ambulance: string,
  fire: string,
  support: string,
  drone: string,
  field: string,
  utility: string,
  hospital: string,
): GeneratedScenarioSpec['agencies'] {
  return { rescue, police, ambulance, fire, support, drone, field, utility, hospital };
}
