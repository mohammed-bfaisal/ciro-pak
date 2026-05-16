import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getAbbottabadCrises(): Crisis[] {
  return [
    {
      id: 'abt-c1',
      type: 'infrastructure',
      title: 'Earthquake M5.4 — Mandian Building Damage + Aftershock Risk',
      location: { lat: 34.1600, lng: 73.2100, label: 'Mandian, Abbottabad', affectedRadiusKm: 8.0 },
      severity: 'critical',
      confidenceScore: 0.95,
      confidenceHistory: [{ t: '06:48', v: 0.65 }, { t: '07:00', v: 0.82 }, { t: '07:30', v: 0.95 }],
      status: 'active',
      detectedAt: '2026-05-20T06:48:00Z',
      estimatedDuration: '48-72 hours',
      affectedPopulation: 80000,
      spreadRisk: 'expanding',
      signalIds: ['abt-s1', 'abt-s2', 'abt-f1', 'abt-n1', 'abt-e1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• abt-s1 (social, credibility 0.78): Building damage in Mandian, school cracks. Velocity 26/min, 578 interactions.
• abt-s2 (social, credibility 0.80): M5.4 confirmed, multiple crack reports. Velocity 22/min, 712 interactions.
• abt-f1 (field_report, credibility 0.95): ERRA — 3 buildings damaged, 1 school unsafe, 28 families evacuated, 6 injuries. 48hr aftershock monitoring. VERIFICATION signal.
• abt-n1 (sensor, credibility 0.95): PMDFC seismic station — M5.4, PGA 0.18g, 3 aftershocks M>2.0 in first hour. Authoritative seismic data.
• abt-e1 (emergency_call, credibility 0.91): 22 rescue calls, 3 families trapped in damaged building.

Severity: CRITICAL — M5.4 with building damage, trapped families, ongoing aftershock sequence.
Confidence: 0.95 — PMDFC seismic + ERRA field + rescue calls + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'abbottabad',
    },
    {
      id: 'abt-c2',
      type: 'infrastructure',
      title: 'KKH Landslide km-272 — 20 Vehicles Stranded',
      location: { lat: 34.1750, lng: 73.1800, label: 'KKH km-272, Sherwan', affectedRadiusKm: 1.0 },
      severity: 'high',
      confidenceScore: 0.90,
      confidenceHistory: [{ t: '08:30', v: 0.65 }, { t: '09:00', v: 0.90 }],
      status: 'active',
      detectedAt: '2026-05-20T08:30:00Z',
      estimatedDuration: '3-6 hours',
      affectedPopulation: 200,
      spreadRisk: 'contained',
      signalIds: ['abt-s3', 'abt-f2', 'abt-t1', 'abt-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• abt-s3 (social, credibility 0.73): KKH blocked by landslide near Mansehra direction. Velocity 18/min, 443 interactions.
• abt-f2 (field_report, credibility 0.93): NHA — 200m³ debris at km-272, 20 vehicles stranded, clearance 3hr. VERIFICATION signal.
• abt-t1 (traffic, credibility 0.80): KKH at 0km/h, 2km queue both sides.
• abt-w1 (weather, credibility 0.85): 20mm/hr rain + post-earthquake unstable slopes — secondary slide risk.

Severity: HIGH — KKH blocked (strategic route), 20 vehicles stranded, secondary slide risk during clearance.
Confidence: 0.90 — NHA field report + traffic + weather corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'abbottabad',
    },
  ];
}

export function getAbbottabadActions(): Action[] {
  return [
    {
      id: 'abt-a1', crisisId: 'abt-c1', type: 'emergency_dispatch',
      title: 'ERRA + Rescue to Mandian — Trapped Family Extraction',
      description: 'Deploy NDMA Rapid Response + Rescue 1122 to Mandian for structural rescue and damage assessment.',
      status: 'completed', executedAt: now(), result: '3 families extracted. Structural engineer on scene assessing school.',
      costPKR: 58000, latencyMs: 390,
      beforeState: { familiesTrapped: 3, schoolAssessed: false }, afterState: { familiesTrapped: 0, extracted: 3, schoolClosed: true },
      trace: [{ step: 1, phase: 'Rescue', observation: '3 families trapped, school structurally unsafe, aftershocks ongoing', inference: 'Rapid extraction before next aftershock is critical', decision: 'Co-deploy NDMA RRT + Rescue ABT-1 + structural engineer', toolCalled: 'dispatch_api', toolResult: 'RRT + Rescue dispatched — ETA 8min', timestamp: now() }],
    },
    {
      id: 'abt-a2', crisisId: 'abt-c2', type: 'traffic_reroute',
      title: 'KKH Alternate Route via Nathiagali Road for Light Vehicles',
      description: 'Divert light vehicles via Nathiagali Road while NHA clears km-272. Heavy vehicles must wait.',
      status: 'completed', executedAt: now(), result: 'Light vehicle diversion active. Heavy vehicles staged 2km back.',
      costPKR: 0, latencyMs: 160,
      beforeState: { kkhStatus: 'fully_blocked' }, afterState: { kkhStatus: 'light_vehicles_diverted', heavyWaiting: true },
      trace: [{ step: 1, phase: 'Routing', observation: '200m³ debris — clearance 3hr. 2km vehicle queue', inference: 'Light vehicles can use Nathiagali Road; heavy vehicles have no alternate', decision: 'Deploy ATP-03 to manage diversion + inform stranded drivers', toolCalled: 'traffic_api', toolResult: 'Nathiagali Road diversion active; NHA ETA 3hr for heavy clearance', timestamp: now() }],
    },
  ];
}

export function getAbbottabadMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '⚠️ EARTHQUAKE 5.4 — Mandian Area Alert', body: 'Abbottabad earthquake 5.4. Mandian area mein purani imartein chhod dain. Aftershocks aane ke chances hain. 1122 call karein madad ke liye. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'transport_authority', channel: 'dashboard', subject: 'KKH BLOCKED — km-272 Sherwan Landslide', body: 'NHA: KKH km-272 blocked — 200m³ debris. Light vehicles via Nathiagali Road. Heavy vehicles staged. Clearance ETA 3 hours. Secondary slide risk — do not send workers without monitoring. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
