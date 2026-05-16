import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getPeshawarCrises(): Crisis[] {
  return [
    {
      id: 'pew-c1',
      type: 'accident',
      title: 'Crowd Emergency — Qissa Khwani Bazaar Crush Injuries',
      location: { lat: 34.0097, lng: 71.5785, label: 'Qissa Khwani Bazaar, Peshawar', affectedRadiusKm: 0.5 },
      severity: 'high',
      confidenceScore: 0.91,
      confidenceHistory: [{ t: '11:00', v: 0.60 }, { t: '11:10', v: 0.78 }, { t: '11:20', v: 0.91 }],
      status: 'active',
      detectedAt: '2026-05-20T11:00:00Z',
      estimatedDuration: '2-4 hours',
      affectedPopulation: 15000,
      spreadRisk: 'contained',
      signalIds: ['pew-s1', 'pew-s2', 'pew-f1', 'pew-e1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• pew-s1 (social, credibility 0.74): Qissa Khwani dangerously overcrowded, person crushed. Velocity 20/min, 379 interactions.
• pew-s2 (social, credibility 0.78): Stampede alert — 3 injured. Velocity 25/min, 565 interactions.
• pew-f1 (field_report, credibility 0.93): KP Police — 15,000 people in 400m. 5 injured. All entry routes blocked. VERIFICATION signal.
• pew-e1 (emergency_call, credibility 0.91): 27 rescue calls — 5 crush injuries, 2 urgent transfers needed.

Severity: HIGH — active crowd crush, 5 injuries, 15K people in confined space, exits blocked.
Confidence: 0.91 — KP Police field report + rescue call data + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'peshawar',
    },
    {
      id: 'pew-c2',
      type: 'flood',
      title: 'Kabul River Flood — Hayatabad Phase 7 / Chamkani Evacuation',
      location: { lat: 34.0050, lng: 71.4600, label: 'Kabul River, Hayatabad', affectedRadiusKm: 5.0 },
      severity: 'critical',
      confidenceScore: 0.93,
      confidenceHistory: [{ t: '08:00', v: 0.62 }, { t: '08:30', v: 0.88 }, { t: '08:45', v: 0.93 }],
      status: 'active',
      detectedAt: '2026-05-20T08:00:00Z',
      estimatedDuration: '10-18 hours',
      affectedPopulation: 35000,
      spreadRisk: 'expanding',
      signalIds: ['pew-s3', 'pew-f2', 'pew-t1', 'pew-w1'],
      conflictingSignalIds: ['pew-s4'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• pew-s3 (social, credibility 0.78): Kabul River Level 4 warning, Hayatabad at risk. Velocity 28/min, 643 interactions.
• pew-s4 (social, credibility 0.05): FLAGGED — "Nothing unusual." Posted 30min before danger gauge reading, zero velocity, 3 likes. DOWN-RANKED.
• pew-f2 (field_report, credibility 0.94): KP-PDMA — 186,000 cusecs, 38% above danger mark. Hayatabad Phase 7 + Chamkani at immediate risk. VERIFICATION signal.
• pew-t1 (traffic, credibility 0.80): GT Road 3km/h — pre-evacuation traffic + Ring Road flooding.
• pew-w1 (weather, credibility 0.85): 35mm/hr rain continuing — river level will keep rising.

Severity: CRITICAL — 38% above danger mark, 400 families pre-evacuating, Ring Road flooding.
Confidence: 0.93 — PDMA gauge + weather + traffic vs 1 discredited dismissal.`,
      actions: [],
      stakeholderMessages: [],
      city: 'peshawar',
    },
  ];
}

export function getPeshawarActions(): Action[] {
  return [
    {
      id: 'pew-a1', crisisId: 'pew-c1', type: 'emergency_dispatch',
      title: 'KP Police Crowd Dispersal + Medical Response — Qissa Khwani',
      description: 'Deploy 3 additional KP Police units for controlled crowd dispersal. Deploy Lady Reading ambulance for crush injuries.',
      status: 'completed', executedAt: now(), result: '3 police units deployed. 5 injured transferred to Lady Reading Hospital.',
      costPKR: 35000, latencyMs: 280,
      beforeState: { policeOnScene: 1, injuriesEvacuated: 0 }, afterState: { policeOnScene: 4, injuriesEvacuated: 5 },
      trace: [{ step: 1, phase: 'Dispatch', observation: '15K in 400m — exits blocked, 5 crush injuries', inference: 'Controlled dispersal + simultaneous medical extraction needed', decision: 'Deploy PEW-07 reinforcements + PEW-09 ambulance', toolCalled: 'dispatch_api', toolResult: 'Police + ambulance dispatched — ETA 6min', timestamp: now() }],
    },
    {
      id: 'pew-a2', crisisId: 'pew-c2', type: 'public_alert',
      title: 'Kabul River Flood Evacuation — Hayatabad Phase 7 + Chamkani',
      description: 'Issue mandatory pre-evacuation advisory for Hayatabad Phase 7 and Chamkani areas.',
      status: 'completed', executedAt: now(), result: 'Evacuation advisory sent to 65,000 residents.',
      costPKR: 32000, latencyMs: 220,
      beforeState: { evacuationAlert: 'none' }, afterState: { evacuationAlert: 'active', residentsNotified: 65000 },
      trace: [{ step: 1, phase: 'Alert', observation: 'Kabul River 38% above danger, rising — Ring Road may flood in 2hr', inference: 'Pre-evacuation now prevents stranding later', decision: 'Issue Hayatabad Ph7 + Chamkani evacuation advisory via SMS', toolCalled: 'sms_gateway', toolResult: '65K SMS queued for delivery', timestamp: now() }],
    },
  ];
}

export function getPeshawarMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '⚠️ CROWD EMERGENCY — Qissa Khwani Band', body: 'Qissa Khwani Bazaar: Bahut zyada bheer — injuries ho rahi hain. Foran wahan se hatain. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'public', channel: 'sms', subject: '🔴 KABUL RIVER FLOOD — Hayatabad Ph7 + Chamkani Khali Karein', body: 'Hayatabad Phase 7 aur Chamkani: Kabul River khatarnak satah par. Foran upar wali jagah jayain. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: 'DEPLOY: Crowd Control + Flood Evacuation', body: 'PEW-07 reinforcements → Qissa Khwani dispersal. PEW-09 + PEW-Alpha → Hayatabad Ph7 flood rescue. KPS drone → aerial monitoring of Ring Road.', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
