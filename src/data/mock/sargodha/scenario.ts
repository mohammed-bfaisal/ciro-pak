import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getSargodhaCrises(): Crisis[] {
  return [
    {
      id: 'sgd-c1',
      type: 'flood',
      title: 'Upper Jhelum Canal Breach — 3 Villages Inundated',
      location: { lat: 32.1000, lng: 72.6400, label: 'Upper Jhelum Canal km-42, Sargodha', affectedRadiusKm: 4.0 },
      severity: 'critical',
      confidenceScore: 0.94,
      confidenceHistory: [{ t: '06:00', v: 0.60 }, { t: '06:20', v: 0.78 }, { t: '06:45', v: 0.94 }],
      status: 'active',
      detectedAt: '2026-05-20T06:00:00Z',
      estimatedDuration: '12-24 hours',
      affectedPopulation: 12000,
      spreadRisk: 'expanding',
      signalIds: ['sgd-s1', 'sgd-s2', 'sgd-f1', 'sgd-n1', 'sgd-e1', 'sgd-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• sgd-s1 (social, credibility 0.77): Canal breach, villages flooding. Velocity 24/min, 467 interactions.
• sgd-s2 (social, credibility 0.75): Satellite Town + 3 villages flooded. Velocity 20/min, 401 interactions.
• sgd-f1 (field_report, credibility 0.94): PDMA — 18m breach, 230 households evacuated, 3 villages inundated. VERIFICATION signal.
• sgd-n1 (sensor, credibility 0.91): Canal gauge 2.4m above design capacity, flow 2.7× normal — breach mechanics confirmed quantitatively.
• sgd-e1 (emergency_call, credibility 0.90): 19 calls, 7 families stranded — ongoing rescue need.
• sgd-t1 (traffic, credibility 0.80): University Road 5km/h — confirms canal water on road.

Severity: CRITICAL — 230 households evacuated, families stranded, canal flow continuing.
Confidence: 0.94 — PDMA + sensor gauge + rescue calls + traffic corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'sargodha',
    },
    {
      id: 'sgd-c2',
      type: 'unknown',
      title: 'Dust Storm Crop Emergency — 4,200 Acres Damaged',
      location: { lat: 32.0500, lng: 72.6000, label: 'Agricultural Outskirts, Sargodha', affectedRadiusKm: 15.0 },
      severity: 'medium',
      confidenceScore: 0.85,
      confidenceHistory: [{ t: '13:00', v: 0.62 }, { t: '14:30', v: 0.85 }],
      status: 'active',
      detectedAt: '2026-05-20T13:00:00Z',
      estimatedDuration: '24-48 hours',
      affectedPopulation: 8000,
      spreadRisk: 'contained',
      signalIds: ['sgd-s3', 'sgd-f2', 'sgd-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• sgd-s3 (social, credibility 0.65): Farmers reporting crop damage from aandhi. Velocity 9/min, 122 interactions.
• sgd-f2 (field_report, credibility 0.91): Agriculture Dept — 4,200 acres damaged, PKR 85M loss estimate. VERIFICATION signal.
• sgd-w1 (weather, credibility 0.85): 55km/h winds from west — dust storm from Thal Desert direction.

Severity: MEDIUM — significant economic damage, canal silt blockage risk downstream.
Confidence: 0.85 — Agriculture Dept field estimate + weather + social reports.`,
      actions: [],
      stakeholderMessages: [],
      city: 'sargodha',
    },
  ];
}

export function getSargodhaActions(): Action[] {
  return [
    {
      id: 'sgd-a1', crisisId: 'sgd-c1', type: 'emergency_dispatch',
      title: 'NDMA + Rescue 1122 to Canal Breach — Tractor Rescue',
      description: 'Deploy Rescue 1122 SGD-2 with high-clearance tractors (boats unavailable) to extract 7 stranded families.',
      status: 'completed', executedAt: now(), result: '7 families extracted via tractor. No casualties.',
      costPKR: 38000, latencyMs: 420,
      beforeState: { familiesStranded: 7 }, afterState: { familiesStranded: 0, extracted: 7 },
      trace: [{ step: 1, phase: 'Assessment', observation: 'No boats at station — 7 families stranded in flooded fields', inference: 'High-clearance tractor is viable extraction method for agricultural terrain', decision: 'Deploy SGD-2 with 3 NDMA tractors — ETA 15min', toolCalled: 'dispatch_api', toolResult: 'Tractors + Rescue SGD-2 dispatched', timestamp: now() }],
    },
    {
      id: 'sgd-a2', crisisId: 'sgd-c1', type: 'utility_escalate',
      title: 'Irrigation Dept — Emergency Canal Breach Repair',
      description: 'Dispatch Irrigation Department emergency breach repair team with sandbags and gabion baskets.',
      status: 'completed', executedAt: now(), result: 'Repair crew on site. Breach narrowing in progress.',
      costPKR: 95000, latencyMs: 380,
      beforeState: { breachStatus: 'open_18m' }, afterState: { breachStatus: 'repair_in_progress', narrowed_to: '12m' },
      trace: [{ step: 1, phase: 'Repair', observation: '18m breach — canal flow continuing at 3,200 cusecs', inference: 'Closing breach is the only way to stop expansion', decision: 'Dispatch Irrigation Dept rapid repair team with 500 sandbags + gabion', toolCalled: 'irrigation_dept_api', toolResult: 'Team dispatched — ETA 25min, breach partially contained', timestamp: now() }],
    },
  ];
}

export function getSargodhaMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '🔴 CANAL BREACH — Chak 80/81/82 Evacuation', body: 'Sargodha: Upper Jhelum Canal breach. Chak 80, 81, 82 NB immediately khali karein. Rescue 1122: 1122. Upar wali manzil par jayain. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'utility_company', channel: 'dashboard', subject: 'EMERGENCY REPAIR: Upper Jhelum Canal km-42', body: 'Irrigation Dept Sargodha: 18m breach at km-42. Rapid repair team deployed. Request additional sandbags + gabion baskets. Flow: 3,200 cusecs — stop downstream gates to reduce pressure. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
