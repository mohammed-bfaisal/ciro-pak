import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getHyderabadCrises(): Crisis[] {
  return [
    {
      id: 'hyd-c1',
      type: 'accident',
      title: 'SITE Chemical Factory Fire — 2 Workers Trapped, Benzene Plume',
      location: { lat: 25.3710, lng: 68.3210, label: 'Jubilee Chemical, SITE Hyderabad', affectedRadiusKm: 1.0 },
      severity: 'high',
      confidenceScore: 0.94,
      confidenceHistory: [{ t: '09:30', v: 0.60 }, { t: '09:45', v: 0.80 }, { t: '10:00', v: 0.94 }],
      status: 'active',
      detectedAt: '2026-05-20T09:30:00Z',
      estimatedDuration: '4-8 hours',
      affectedPopulation: 25000,
      spreadRisk: 'expanding',
      signalIds: ['hyd-s1', 'hyd-s2', 'hyd-f1', 'hyd-n1', 'hyd-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• hyd-s1 (social, credibility 0.75): SITE factory fire, black smoke. Velocity 22/min, 412 interactions.
• hyd-s2 (social, credibility 0.78): 3 explosions, worker trapped. Velocity 27/min, 610 interactions.
• hyd-f1 (field_report, credibility 0.94): Rescue 1122 — Jubilee Chemical fire in solvent storage, 2 trapped, foam suppression, 500m exclusion zone. VERIFICATION.
• hyd-n1 (sensor, credibility 0.89): Benzene 4.2 ppm (840× safe limit), VOC 28× baseline — carcinogenic plume confirmed moving toward Latifabad.
• hyd-t1 (traffic, credibility 0.80): Hatri Road 0km/h — emergency response blockage.

Severity: HIGH — 2 trapped, benzene 840× safe limit drifting SW to residential area.
Confidence: 0.94 — Rescue 1122 + sensor data + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'hyderabad',
    },
    {
      id: 'hyd-c2',
      type: 'flood',
      title: 'Qasimabad Drainage Failure — 400 Households Inundated',
      location: { lat: 25.4100, lng: 68.3900, label: 'Qasimabad, Hyderabad', affectedRadiusKm: 2.5 },
      severity: 'high',
      confidenceScore: 0.88,
      confidenceHistory: [{ t: '11:00', v: 0.62 }, { t: '11:30', v: 0.88 }],
      status: 'active',
      detectedAt: '2026-05-20T11:00:00Z',
      estimatedDuration: '6-10 hours',
      affectedPopulation: 18000,
      spreadRisk: 'contained',
      signalIds: ['hyd-s3', 'hyd-f2', 'hyd-e1', 'hyd-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• hyd-s3 (social, credibility 0.69): Qasimabad streets flooded, Auto Baan Road impassable. Velocity 16/min, 212 interactions.
• hyd-f2 (field_report, credibility 0.91): WASA — 3 blocked junctions, 60cm water depth, 400 households, pumping commenced. VERIFICATION.
• hyd-e1 (emergency_call, credibility 0.91): 13 flood rescue calls, 7 rooftop strandings.
• hyd-w1 (weather, credibility 0.85): 32mm/hr continuing — drainage already overwhelmed.

Severity: HIGH — 400 households, 60cm depth, 7 families stranded, rain continuing.
Confidence: 0.88 — WASA field + rescue calls + weather + social.`,
      actions: [],
      stakeholderMessages: [],
      city: 'hyderabad',
    },
  ];
}

export function getHyderabadActions(): Action[] {
  return [
    {
      id: 'hyd-a1', crisisId: 'hyd-c1', type: 'emergency_dispatch',
      title: 'HazMat Fire + Worker Extraction — SITE Jubilee Chemical',
      description: 'Deploy HF-08 + HF-11 fire engines with foam. Rescue HYD-Alpha for worker extraction.',
      status: 'completed', executedAt: now(), result: '2 workers extracted. Fire containment at 60%. Plume monitoring active.',
      costPKR: 78000, latencyMs: 360,
      beforeState: { workersTrapped: 2 }, afterState: { workersTrapped: 0, extracted: 2, fireContainment: '60%' },
      trace: [{ step: 1, phase: 'Dispatch', observation: '2 trapped, solvent fire with 3 explosions, benzene plume SW', inference: 'Foam suppression + simultaneous rescue required — cannot wait for fire to subside', decision: 'Co-deploy HF-08 + HF-11 foam + HYD-Alpha extraction team', toolCalled: 'dispatch_api', toolResult: 'All units dispatched — ETA 5min', timestamp: now() }],
    },
    {
      id: 'hyd-a2', crisisId: 'hyd-c1', type: 'public_alert',
      title: 'Benzene Plume Shelter-In-Place — Latifabad Residential',
      description: 'Issue shelter-in-place advisory for Latifabad area downwind of benzene plume.',
      status: 'completed', executedAt: now(), result: 'Advisory sent to 60,000 Latifabad residents.',
      costPKR: 30000, latencyMs: 190,
      beforeState: { latifabadAlert: 'none' }, afterState: { latifabadAlert: 'shelter_in_place', residentsNotified: 60000 },
      trace: [{ step: 1, phase: 'Alert', observation: 'Benzene 840× safe limit drifting toward Latifabad in 8km/h SW wind', inference: 'Evacuation would expose residents to plume during transit — shelter safer', decision: 'Issue shelter-in-place advisory — close windows, seal gaps, avoid outdoor activity', toolCalled: 'sms_gateway', toolResult: '60K SMS sent', timestamp: now() }],
    },
    {
      id: 'hyd-a3', crisisId: 'hyd-c2', type: 'emergency_dispatch',
      title: 'Rescue + WASA Dewatering — Qasimabad Flood',
      description: 'Deploy Rescue HYD-Alpha boats + WASA HWD-04 pump to Qasimabad for family extraction and dewatering.',
      status: 'completed', executedAt: now(), result: '7 families extracted. WASA pumping at full capacity.',
      costPKR: 42000, latencyMs: 290,
      beforeState: { familiesStranded: 7, dewateringActive: false }, afterState: { familiesStranded: 0, dewateringActive: true },
      trace: [{ step: 1, phase: 'Rescue', observation: '7 families on rooftops, 60cm water depth, rain continuing', inference: 'Simultaneous rescue + dewatering needed', decision: 'Split HYD-Alpha: 4 members for rescue boats, 4 assist WASA at junction 3', toolCalled: 'dispatch_api', toolResult: 'HYD-Alpha + HWD-04 dispatched to Qasimabad', timestamp: now() }],
    },
  ];
}

export function getHyderabadMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '⚠️ CHEMICAL PLUME — Latifabad Shelter-In-Place', body: 'Latifabad: Factory fire se zeher wali hawa aa rahi hai. Ghar ke andar rahain, khidkiyan band karein. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'public', channel: 'sms', subject: '🔴 QASIMABAD FLOOD — Rescue Coming', body: 'Qasimabad: Paani 60cm. 7 families ke liye rescue boats bhej diye gaye hain. Ghar ki chhat par rahain. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: 'DUAL RESPONSE: SITE Fire + Qasimabad Flood', body: 'HF-08 + HF-11 → SITE fire. HYD-Alpha → worker extraction + Qasimabad boats. HWD-04 → Qasimabad pump. SSC drone → plume tracking.', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
