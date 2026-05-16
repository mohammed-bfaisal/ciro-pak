import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getMultanCrises(): Crisis[] {
  return [
    {
      id: 'mtn-c1',
      type: 'heatwave',
      title: 'Extreme Heatwave 47°C — City-wide Health Emergency',
      location: { lat: 30.1960, lng: 71.4730, label: 'Hussain Agahi / Multan City', affectedRadiusKm: 10.0 },
      severity: 'critical',
      confidenceScore: 0.95,
      confidenceHistory: [
        { t: '11:00', v: 0.72 }, { t: '11:45', v: 0.88 }, { t: '12:00', v: 0.95 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T11:00:00Z',
      estimatedDuration: '8-12 hours',
      affectedPopulation: 500000,
      spreadRisk: 'expanding',
      signalIds: ['mtn-s1', 'mtn-s2', 'mtn-f1', 'mtn-e1', 'mtn-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• mtn-s1 (social, credibility 0.79): 3 fainting cases at Hussain Agahi at 47°C. High velocity (26/min), 610 interactions.
• mtn-s2 (social, credibility 0.76): 21 heatstroke patients at Civil Hospital, 3 critical. Velocity 19/min, 810 interactions.
• mtn-f1 (field_report, credibility 0.93): PDMA confirms 47.2°C — 4th highest in Multan history. 21 heatstroke by noon, 3 critical. VERIFICATION signal.
• mtn-e1 (emergency_call, credibility 0.91): 31 rescue calls in 2 hours — 8 public space collapses. Hussain Agahi hardest hit.
• mtn-w1 (weather, credibility 0.85): 47.2°C, heat index 54°C — life-threatening without cooling.

Severity: CRITICAL — multiple hospitalised, heat index 54°C, 500K exposed.
Confidence: 0.95 — PDMA declaration + hospital data + rescue call spike + weather corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'multan',
    },
    {
      id: 'mtn-c2',
      type: 'infrastructure',
      title: 'Vehari Chowk Underpass Structural Crack — Road Closure',
      location: { lat: 30.1752, lng: 71.5102, label: 'Vehari Chowk Underpass', affectedRadiusKm: 0.8 },
      severity: 'high',
      confidenceScore: 0.88,
      confidenceHistory: [
        { t: '09:30', v: 0.55 }, { t: '09:50', v: 0.88 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T09:30:00Z',
      estimatedDuration: '24-72 hours',
      affectedPopulation: 15000,
      spreadRisk: 'contained',
      signalIds: ['mtn-s3', 'mtn-f2', 'mtn-t1'],
      conflictingSignalIds: ['mtn-s4'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• mtn-s3 (social, credibility 0.74): Underpass crack + truck stuck. Velocity 18/min, 346 interactions.
• mtn-s4 (social, credibility 0.07): FLAGGED — "Exaggeration." Posted 20min before confirmation report, zero velocity, 1 like. DOWN-RANKED.
• mtn-f2 (field_report, credibility 0.92): NHA Inspector confirms 8m × 3cm structural crack, heat expansion + subbase erosion. Road closed. VERIFICATION signal.
• mtn-t1 (traffic, credibility 0.80): Vehari Road at 0km/h — full closure confirmed.

Severity: HIGH — structural crack on active road, load-bearing capacity compromised, requires engineering inspection.
Confidence: 0.88 — NHA field verification + traffic closure + social corroboration vs 1 discredited denial.`,
      actions: [],
      stakeholderMessages: [],
      city: 'multan',
    },
  ];
}

export function getMultanActions(): Action[] {
  return [
    {
      id: 'mtn-a1',
      crisisId: 'mtn-c1',
      type: 'emergency_dispatch',
      title: 'Deploy Mobile Cooling Stations — Hussain Agahi & Ghanta Ghar',
      description: 'Deploy PDMA mobile health unit and WASA cooling tankers to Hussain Agahi Chowk and Ghanta Ghar market.',
      status: 'completed',
      executedAt: now(),
      result: '2 cooling stations active. PDMA unit treating 14 patients.',
      costPKR: 55000,
      latencyMs: 310,
      beforeState: { coolingStations: 0 },
      afterState: { coolingStations: 2, patientsOnsite: 14 },
      trace: [
        { step: 1, phase: 'Planning', observation: '8 collapses in Hussain Agahi, 47°C heat index 54°C', inference: 'Hussain Agahi is the epicentre — dense bazaar with no shade or cooling', decision: 'Deploy PDMA mobile unit + WM-04 water tanker for misting', toolCalled: 'dispatch_api', toolResult: 'PDMA unit + WM-04 dispatched — ETA 12min', timestamp: now() },
      ],
    },
    {
      id: 'mtn-a2',
      crisisId: 'mtn-c1',
      type: 'public_alert',
      title: 'Heatwave Emergency SMS — City-wide',
      description: 'Issue life-safety SMS advisory across Multan: avoid outdoor activity, hydration, nearest cooling point.',
      status: 'completed',
      executedAt: now(),
      result: 'Alert SMS sent to 650,000 Multan residents.',
      costPKR: 65000,
      latencyMs: 240,
      beforeState: { heatAlert: 'none' },
      afterState: { heatAlert: 'active', residentsNotified: 650000 },
      trace: [
        { step: 1, phase: 'Alert', observation: '47.2°C declared by PMD — heat index 54°C', inference: 'Life-threatening for elderly/children outdoors', decision: 'Mass SMS in Urdu + English with cooling point locations', toolCalled: 'sms_gateway', toolResult: '650K SMS queued', timestamp: now() },
      ],
    },
    {
      id: 'mtn-a3',
      crisisId: 'mtn-c2',
      type: 'traffic_reroute',
      title: 'Vehari Road Diversion via Bosan Road',
      description: 'Reroute Vehari Road traffic via Bosan Road and Khanewal Road to bypass closed underpass.',
      status: 'completed',
      executedAt: now(),
      result: 'Diversion signs placed. Navigation apps updated.',
      costPKR: 0,
      latencyMs: 120,
      beforeState: { vehariRoad: 'closed' },
      afterState: { vehariRoad: 'diverted_via_bosan' },
      trace: [
        { step: 1, phase: 'Routing', observation: 'Vehari Chowk underpass closed indefinitely', inference: 'Bosan Road is the nearest parallel route with same capacity', decision: 'Deploy MP-11 traffic officers + push diversion to navigation apps', toolCalled: 'traffic_api', toolResult: 'Diversion active on Google Maps + Waze', timestamp: now() },
      ],
    },
  ];
}

export function getMultanMessages(): StakeholderMessage[] {
  return [
    {
      audience: 'public',
      channel: 'sms',
      subject: '🔴 GARMI EMERGENCY — 47°C Multan',
      body: 'Multan: 47 degree — zindagi ka khatrah! Ghante 11 se 5 baje tak ghar mein rahain. Khub thanda pani piyain. Hussain Agahi + Ghanta Ghar par cooling stations lagaye gaye hain. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'hospitals',
      channel: 'dashboard',
      subject: 'HEATSTROKE SURGE ALERT — Civil + Nishtar Hospital',
      body: 'Civil + Nishtar: Expect sustained heatstroke admissions. 21 already in — 3 critical. PDMA mobile unit deployed. Keep IV saline and cooling protocols ready. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'transport_authority',
      channel: 'dashboard',
      subject: 'ROAD CLOSURE: Vehari Chowk Underpass — Structural Crack',
      body: 'NHA Multan: Vehari Chowk underpass closed — 8m structural crack. Engineering inspection required. Diversion: Bosan Road → Khanewal Road. HGV trucks banned on diversion route.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
  ];
}
