import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getBahawalpurCrises(): Crisis[] {
  return [
    {
      id: 'bwp-c1',
      type: 'unknown',
      title: 'Desert Sandstorm — Zero Visibility, Multan Road Accidents',
      location: { lat: 29.3956, lng: 71.6836, label: 'Bahawalpur City', affectedRadiusKm: 12.0 },
      severity: 'high',
      confidenceScore: 0.91,
      confidenceHistory: [{ t: '14:00', v: 0.72 }, { t: '14:10', v: 0.85 }, { t: '14:30', v: 0.91 }],
      status: 'active',
      detectedAt: '2026-05-20T14:00:00Z',
      estimatedDuration: '4-8 hours',
      affectedPopulation: 400000,
      spreadRisk: 'expanding',
      signalIds: ['bwp-s1', 'bwp-s2', 'bwp-f1', 'bwp-n1', 'bwp-t1', 'bwp-e1', 'bwp-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• bwp-s1 (social, credibility 0.73): Zero visibility on Circular Road. Velocity 19/min, 346 interactions.
• bwp-s2 (social, credibility 0.71): Airport suspended, road accidents, dust entering homes. Velocity 14/min, 265 interactions.
• bwp-f1 (field_report, credibility 0.93): PMD confirms 68km/h winds, PM10 1800 µg/m³, NOTAM issued. VERIFICATION signal.
• bwp-n1 (sensor, credibility 0.88): PM10 1,842 µg/m³ (12× threshold) — quantitative confirmation.
• bwp-t1 (traffic, credibility 0.80): Multan Road at 0km/h, 4 accidents reported.
• bwp-e1 (emergency_call, credibility 0.90): 14 accident calls in 1 hour, 6 injuries.
• bwp-w1 (weather, credibility 0.85): 68km/h winds from Cholistan direction — no rainfall expected to settle dust.

Severity: HIGH — zero visibility, 14 accidents in 1hr, PM10 12× threshold, airport closed.
Confidence: 0.91 — PMD + sensor + rescue call data + traffic corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'bahawalpur',
    },
    {
      id: 'bwp-c2',
      type: 'disease_cluster',
      title: 'Victoria Hospital Overcrowding — 148% Capacity',
      location: { lat: 29.3850, lng: 71.6750, label: 'Victoria Hospital, Bahawalpur', affectedRadiusKm: 1.0 },
      severity: 'high',
      confidenceScore: 0.89,
      confidenceHistory: [{ t: '10:00', v: 0.65 }, { t: '11:00', v: 0.89 }],
      status: 'active',
      detectedAt: '2026-05-20T10:00:00Z',
      estimatedDuration: '24-48 hours',
      affectedPopulation: 3000,
      spreadRisk: 'expanding',
      signalIds: ['bwp-s3', 'bwp-f2'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• bwp-s3 (social, credibility 0.72): Victoria Hospital emergency full, children on floor. Velocity 17/min, 289 interactions.
• bwp-f2 (field_report, credibility 0.92): DHO confirms 148% capacity — 210 vs 142 beds. Respiratory + gastroenteritis co-surge. VERIFICATION signal.

Severity: HIGH — 148% capacity, children on floor mats, dual-disease surge.
Confidence: 0.89 — DHO field report + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'bahawalpur',
    },
  ];
}

export function getBahawalpurActions(): Action[] {
  return [
    {
      id: 'bwp-a1', crisisId: 'bwp-c1', type: 'public_alert',
      title: 'Sandstorm Stay-Indoors Advisory — Bahawalpur City',
      description: 'Issue emergency advisory for all residents to stay indoors, cover food/water, avoid roads.',
      status: 'completed', executedAt: now(), result: 'Advisory SMS sent to 450,000 residents.',
      costPKR: 45000, latencyMs: 210,
      beforeState: { stormAdvisory: 'none' }, afterState: { stormAdvisory: 'active', residentsNotified: 450000 },
      trace: [{ step: 1, phase: 'Alert', observation: 'PM10 12× threshold, zero visibility, accidents ongoing', inference: 'Staying indoors is the primary life-safety measure', decision: 'Issue bilingual advisory — avoid roads, cover food, shelter pets', toolCalled: 'sms_gateway', toolResult: '450K SMS queued', timestamp: now() }],
    },
    {
      id: 'bwp-a2', crisisId: 'bwp-c2', type: 'hospital_notify',
      title: 'Emergency Bed Surge — Transfer Patients to Civil Hospital',
      description: 'Coordinate patient transfer from Victoria to Civil Hospital. Request Punjab Health Dept field hospital.',
      status: 'completed', executedAt: now(), result: '42 patients transferred. Punjab field hospital unit en route.',
      costPKR: 35000, latencyMs: 480,
      beforeState: { victoriaPct: 148, transferred: 0 }, afterState: { victoriaPct: 118, transferred: 42 },
      trace: [{ step: 1, phase: 'Coordination', observation: 'Victoria at 148% — children on floor', inference: 'Transfer stable patients to Civil Hospital to free critical capacity', decision: 'Dispatch BHP-04 + BHP-07 ambulances for 42 transfer patients', toolCalled: 'hospital_api', toolResult: 'Transfer protocol activated; Punjab field hospital unit dispatched', timestamp: now() }],
    },
  ];
}

export function getBahawalpurMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '⚠️ AANDHI — Ghar Mein Rahain', body: 'Bahawalpur: Tez aandhi — bahar mat jayain. Khanay aur paani ko dhak lain. Multan Road band hai. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'hospitals', channel: 'dashboard', subject: 'SURGE RESPONSE: Victoria Hospital 148%', body: 'Victoria Hospital: 148% capacity — 42 transfers to Civil Hospital in progress. Punjab field hospital unit dispatched. Prepare respiratory + gastro wards. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
