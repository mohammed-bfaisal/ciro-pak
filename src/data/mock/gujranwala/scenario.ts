import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getGujranwalaCrises(): Crisis[] {
  return [
    {
      id: 'gjw-c1',
      type: 'accident',
      title: 'Textile Factory Fire — Kot Abdul Malik, Chemical Storage Involved',
      location: { lat: 32.1505, lng: 74.2205, label: 'Kot Abdul Malik, Sialkot Road', affectedRadiusKm: 0.6 },
      severity: 'high',
      confidenceScore: 0.93,
      confidenceHistory: [{ t: '09:00', v: 0.62 }, { t: '09:15', v: 0.80 }, { t: '09:25', v: 0.93 }],
      status: 'active',
      detectedAt: '2026-05-20T09:00:00Z',
      estimatedDuration: '3-6 hours',
      affectedPopulation: 8000,
      spreadRisk: 'expanding',
      signalIds: ['gjw-s1', 'gjw-s2', 'gjw-f1', 'gjw-n1', 'gjw-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• gjw-s1 (social, credibility 0.76): Factory fire, smoke to sky level. Velocity 23/min, 442 interactions.
• gjw-s2 (social, credibility 0.80): Workers trapped, 3 injured. Velocity 29/min, 657 interactions.
• gjw-f1 (field_report, credibility 0.94): Rescue 1122 — chemical storage involved, 6 rescued, 4 still inside. VERIFICATION signal.
• gjw-n1 (sensor, credibility 0.87): PM2.5 387 µg/m³, VOC 12× baseline — chemical fire confirmed by air quality data.
• gjw-t1 (traffic, credibility 0.80): Sialkot Road at 0km/h — confirms major emergency response on scene.

Severity: HIGH — workers trapped, chemical storage involved, smoke drift risk.
Confidence: 0.93 — field verification + sensor + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'gujranwala',
    },
    {
      id: 'gjw-c2',
      type: 'disease_cluster',
      title: 'WASA Water Contamination — E.coli City District (200K consumers)',
      location: { lat: 32.1877, lng: 74.1945, label: 'Gujranwala City District', affectedRadiusKm: 8.0 },
      severity: 'high',
      confidenceScore: 0.91,
      confidenceHistory: [{ t: '07:30', v: 0.55 }, { t: '08:30', v: 0.91 }],
      status: 'active',
      detectedAt: '2026-05-20T07:30:00Z',
      estimatedDuration: '12-24 hours',
      affectedPopulation: 200000,
      spreadRisk: 'contained',
      signalIds: ['gjw-s3', 'gjw-f2', 'gjw-w1'],
      conflictingSignalIds: ['gjw-s4'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• gjw-s3 (social, credibility 0.70): Yellow discoloured water with smell. Velocity 14/min, 212 interactions.
• gjw-s4 (social, credibility 0.04): FLAGGED — "It's always like this." Posted 25min before lab report, zero velocity, 2 likes. DOWN-RANKED.
• gjw-f2 (field_report, credibility 0.95): WASA lab confirms E.coli + NTU 48 (12× threshold). Satellite Town pumping station contamination. VERIFICATION signal.

Severity: HIGH — E.coli confirmed, 200K consumers, public health emergency.
Confidence: 0.91 — WASA lab test + social reports vs 1 discredited dismissal.`,
      actions: [],
      stakeholderMessages: [],
      city: 'gujranwala',
    },
  ];
}

export function getGujranwalaActions(): Action[] {
  return [
    {
      id: 'gjw-a1', crisisId: 'gjw-c1', type: 'emergency_dispatch',
      title: 'Deploy Fire Brigade + Rescue to Kot Abdul Malik',
      description: 'Deploy GF-07 and GF-12 fire engines with Rescue 1122 GJW-2 for worker extraction and fire suppression.',
      status: 'completed', executedAt: now(), result: '3 engines on scene. Worker extraction in progress.',
      costPKR: 72000, latencyMs: 350,
      beforeState: { fireEnginesOnScene: 0 }, afterState: { fireEnginesOnScene: 3, workersExtracted: 6 },
      trace: [{ step: 1, phase: 'Dispatch', observation: '4 workers trapped, chemical storage involved', inference: 'Multi-engine response + rescue team needed simultaneously', decision: 'Co-deploy GF-07 + GF-12 + Rescue GJW-2', toolCalled: 'dispatch_api', toolResult: 'All units dispatched — ETA 7min', timestamp: now() }],
    },
    {
      id: 'gjw-a2', crisisId: 'gjw-c2', type: 'public_alert',
      title: 'Water Boil Advisory — Gujranwala City District',
      description: 'Issue urgent do-not-drink advisory. Distribute clean water via WASA tankers.',
      status: 'completed', executedAt: now(), result: 'Advisory SMS sent. WG-02 tanker dispatched to distribution points.',
      costPKR: 52000, latencyMs: 290,
      beforeState: { waterAdvisory: 'none' }, afterState: { waterAdvisory: 'do_not_drink', tankerDeployed: true },
      trace: [{ step: 1, phase: 'Alert', observation: 'E.coli + NTU 48 — 200K consumers at risk of waterborne illness', inference: 'Do-not-drink advisory + alternate supply must be simultaneous', decision: 'Issue SMS + deploy WG-02 to 5 distribution points', toolCalled: 'sms_gateway', toolResult: '200K SMS queued; WG-02 dispatched', timestamp: now() }],
    },
  ];
}

export function getGujranwalaMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '⚠️ PAANI GANDA — Peeney se parhez karein', body: 'Gujranwala: WASA ka paani peeney ke qabil nahi. Pehle ubaalein ya botal ka paani istemaal karein. Pani ke tanker shehar mein bhejey ja rahe hain. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: 'DEPLOY: Factory Fire + Water Contamination', body: 'GF-07 + GF-12 + Rescue GJW-2 → Kot Abdul Malik. WG-02 tanker → City District water points. Traffic GP-09 → Sialkot Road diversion.', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
