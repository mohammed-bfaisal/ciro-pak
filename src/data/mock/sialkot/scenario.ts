import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getSialkotCrises(): Crisis[] {
  return [
    {
      id: 'skt-c1',
      type: 'flood',
      title: 'River Aik Breach — Paris Road / Sialkot Bypass Inundation',
      location: { lat: 32.5100, lng: 74.5400, label: 'River Aik, Sialkot Bypass', affectedRadiusKm: 3.0 },
      severity: 'high',
      confidenceScore: 0.92,
      confidenceHistory: [{ t: '07:00', v: 0.60 }, { t: '07:18', v: 0.76 }, { t: '07:30', v: 0.92 }],
      status: 'active',
      detectedAt: '2026-05-20T07:00:00Z',
      estimatedDuration: '8-12 hours',
      affectedPopulation: 14000,
      spreadRisk: 'expanding',
      signalIds: ['skt-s1', 'skt-s2', 'skt-f1', 'skt-t1', 'skt-e1', 'skt-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• skt-s1 (social, credibility 0.75): River Aik breach, Paris Road + Airport Road flooded. Velocity 22/min, 411 interactions.
• skt-s2 (social, credibility 0.74): Bypass breach confirmed, effluent mixing with floodwater. Velocity 16/min, 301 interactions.
• skt-f1 (field_report, credibility 0.93): PDMA confirms breach, 1.2m above danger mark, 120 families displaced. VERIFICATION signal.
• skt-t1 (traffic, credibility 0.80): Airport Road 3km/h — confirms flooding on main artery.
• skt-e1 (emergency_call, credibility 0.91): 24 rescue calls, 9 families stranded.
• skt-w1 (weather, credibility 0.85): 28mm/hr rain — river at bank-full stage.

Severity: HIGH — 120 families displaced, rescue operations ongoing, contamination risk.
Confidence: 0.92 — PDMA field verification + rescue call data + traffic + weather corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'sialkot',
    },
    {
      id: 'skt-c2',
      type: 'disease_cluster',
      title: 'Industrial Effluent Contamination — River Aik (Chromium VI)',
      location: { lat: 32.4880, lng: 74.5100, label: 'Leather Industrial Zone, Wazirabad Road', affectedRadiusKm: 5.0 },
      severity: 'medium',
      confidenceScore: 0.88,
      confidenceHistory: [{ t: '08:30', v: 0.65 }, { t: '08:45', v: 0.88 }],
      status: 'active',
      detectedAt: '2026-05-20T08:30:00Z',
      estimatedDuration: '48-96 hours',
      affectedPopulation: 30000,
      spreadRisk: 'expanding',
      signalIds: ['skt-s3', 'skt-f2', 'skt-n1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• skt-s3 (social, credibility 0.69): Black water + leather factory effluent into River Aik. Velocity 11/min, 145 interactions.
• skt-f2 (field_report, credibility 0.94): SEPA confirms Chromium VI at 8× safe limit, 5 factories stopped. VERIFICATION signal.
• skt-n1 (sensor, credibility 0.89): River water sensor: 480 µg/L Chromium VI (safe: 50 µg/L). Dissolved oxygen critical. Authoritative quantitative data.

Severity: MEDIUM — carcinogenic contamination, downstream communities at risk, river unusable.
Confidence: 0.88 — sensor reading + SEPA verification + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'sialkot',
    },
  ];
}

export function getSialkotActions(): Action[] {
  return [
    {
      id: 'skt-a1', crisisId: 'skt-c1', type: 'emergency_dispatch',
      title: 'Rescue Boats to Paris Road Flood Zone',
      description: 'Deploy Rescue 1122 SKT-1 with inflatable boats to Paris Road. Extract 9 stranded families.',
      status: 'completed', executedAt: now(), result: '9 families extracted. No casualties.',
      costPKR: 42000, latencyMs: 310,
      beforeState: { familiesStranded: 9 }, afterState: { familiesStranded: 0, extracted: 9 },
      trace: [{ step: 1, phase: 'Rescue', observation: '9 families on rooftops, water 1.2m above danger', inference: 'Boat extraction is the only safe method', decision: 'Deploy SKT-1 with 2 boats — ETA 10min', toolCalled: 'dispatch_api', toolResult: 'SKT-1 dispatched', timestamp: now() }],
    },
    {
      id: 'skt-a2', crisisId: 'skt-c2', type: 'utility_escalate',
      title: 'SEPA Factory Shutdown — Leather Tanneries Wazirabad Road',
      description: 'Enforce immediate stop-work for 5 tanneries discharging into River Aik. Issue Chromium VI contamination alert downstream.',
      status: 'completed', executedAt: now(), result: '5 factories shut. Downstream alert issued.',
      costPKR: 0, latencyMs: 190,
      beforeState: { factoriesDischarging: 5 }, afterState: { factoriesDischarging: 0, stopWorkOrders: 5 },
      trace: [{ step: 1, phase: 'Enforcement', observation: 'Chromium VI 8× safe limit — carcinogenic discharge ongoing', inference: 'Every hour of discharge worsens downstream contamination', decision: 'Enforce SEPA stop-work on all 5 identified factories', toolCalled: 'sepa_enforcement_api', toolResult: '5 stop-work orders issued; factories shut', timestamp: now() }],
    },
  ];
}

export function getSialkotMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '🔴 FLOOD ALERT — River Aik Bypass', body: 'Paris Road, Airport Road: River Aik overflow. Immediately move to higher ground. Rescue 1122 boats on the way. Call 1122 for help. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'public', channel: 'sms', subject: '⚠️ RIVER AIK PAANI NA ISTEMAAL KAREIN', body: 'Sialkot: River Aik mein industrial zeher (Chromium) hai. Nalay ka paani na piyain, gharon mein na lagayain. SEPA action le raha hai. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
