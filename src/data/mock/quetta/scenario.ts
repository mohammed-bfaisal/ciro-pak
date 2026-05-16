import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getQuettaCrises(): Crisis[] {
  return [
    {
      id: 'qta-c1',
      type: 'infrastructure',
      title: 'Earthquake M5.8 — Sariab Road Building Collapses, 6 Fatalities',
      location: { lat: 30.1600, lng: 66.9600, label: 'Sariab Road, Quetta', affectedRadiusKm: 6.0 },
      severity: 'critical',
      confidenceScore: 0.97,
      confidenceHistory: [{ t: '04:15', v: 0.70 }, { t: '04:30', v: 0.88 }, { t: '05:00', v: 0.97 }],
      status: 'active',
      detectedAt: '2026-05-20T04:15:00Z',
      estimatedDuration: '72-96 hours',
      affectedPopulation: 150000,
      spreadRisk: 'expanding',
      signalIds: ['qta-s1', 'qta-s2', 'qta-f1', 'qta-n1', 'qta-e1', 'qta-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• qta-s1 (social, credibility 0.81): Buildings collapsing Sariab Road. Velocity 31/min, 757 interactions.
• qta-s2 (social, credibility 0.80): M5.8 confirmed, CMH overwhelmed, 38 injured. Velocity 28/min, 946 interactions.
• qta-f1 (field_report, credibility 0.95): PDMA — M5.8, 14 collapses, 38 injured, 4 critical, 6 FATALITIES. VERIFICATION signal.
• qta-n1 (sensor, credibility 0.95): PMDFC seismic — M5.8, PGA 0.31g, 7 aftershocks M>2.5 in 90min. Authoritative.
• qta-e1 (emergency_call, credibility 0.92): 61 Levies calls in 90min, 14 confirmed collapses.
• qta-w1 (weather, credibility 0.85): -2°C + snowfall — compounds rescue difficulty.

Severity: CRITICAL — 6 fatalities confirmed, 14 building collapses, -2°C rescue conditions.
Confidence: 0.97 — Seismic sensor + PDMA fatality report + rescue call volume.`,
      actions: [],
      stakeholderMessages: [],
      city: 'quetta',
    },
    {
      id: 'qta-c2',
      type: 'infrastructure',
      title: 'N-25 Highway Blocked — Snowfall + Rockfall, 34 Vehicles Stranded',
      location: { lat: 29.8000, lng: 66.8500, label: 'N-25 km-82, Mastung', affectedRadiusKm: 2.0 },
      severity: 'high',
      confidenceScore: 0.91,
      confidenceHistory: [{ t: '05:30', v: 0.68 }, { t: '06:00', v: 0.91 }],
      status: 'active',
      detectedAt: '2026-05-20T05:30:00Z',
      estimatedDuration: '4-8 hours',
      affectedPopulation: 400,
      spreadRisk: 'contained',
      signalIds: ['qta-s3', 'qta-f2', 'qta-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• qta-s3 (social, credibility 0.72): N-25 blocked by snow + earthquake rockfall. Velocity 16/min, 401 interactions.
• qta-f2 (field_report, credibility 0.94): NHA — 1.8m snowfall + rockfall, 34 vehicles stranded including 6 buses, -3°C, clearance 4hr. VERIFICATION signal.
• qta-t1 (traffic, credibility 0.80): N-25 at 0km/h — full closure confirmed.

Severity: HIGH — 6 buses stranded at -3°C, no alternate route for heavy vehicles, hypothermia risk.
Confidence: 0.91 — NHA field report + traffic closure data + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'quetta',
    },
  ];
}

export function getQuettaActions(): Action[] {
  return [
    {
      id: 'qta-a1', crisisId: 'qta-c1', type: 'emergency_dispatch',
      title: 'NDMA + Levies Rescue — Sariab Road Collapse Sites',
      description: 'Deploy NDMA QTA-Alpha and Levies QL-07 to 14 collapse sites. Prioritise buildings with confirmed trapped survivors.',
      status: 'completed', executedAt: now(), result: 'Both teams on scene. 23 survivors extracted. Search continues.',
      costPKR: 120000, latencyMs: 480,
      beforeState: { teamsDeployed: 0, survivorsExtracted: 0 }, afterState: { teamsDeployed: 2, survivorsExtracted: 23 },
      trace: [
        { step: 1, phase: 'Triage', observation: '14 building collapses, 6 fatalities, -2°C conditions', inference: 'Largest NDMA team + Levies needed simultaneously — cold worsens survivor survival window', decision: 'Co-deploy QTA-Alpha + QL-07 to triage-prioritised collapse sites', toolCalled: 'dispatch_api', toolResult: 'Both teams dispatched — ETA 9min', timestamp: now() },
      ],
    },
    {
      id: 'qta-a2', crisisId: 'qta-c1', type: 'hospital_notify',
      title: 'CMH + Civil Hospital Surge Protocol Activation',
      description: 'Activate mass casualty protocol at CMH and Civil Hospital. Request military medical support from Quetta Garrison.',
      status: 'recovered', executedAt: now(), result: 'Protocols activated. Garrison surgical team deployed via alternate channel.',
      costPKR: 0, latencyMs: 1680,
      beforeState: { massCasualtyProtocol: 'inactive' }, afterState: { massCasualtyProtocol: 'active', garrisonTeam: 'deployed' },
      trace: [
        { step: 1, phase: 'Attempt 1', observation: 'POST /mass-casualty to CMH Hospital Management System', inference: 'System should activate surge protocol', decision: 'Submit activation request', toolCalled: 'hospital_api', toolResult: 'HTTP 503 — CMH system offline (power outage from earthquake)', timestamp: now() },
        { step: 2, phase: 'Retry', observation: 'CMH API down — earthquake likely damaged server room', inference: 'Need direct contact with CMH command', decision: 'Route via Quetta Garrison emergency radio channel', toolCalled: 'garrison_radio_api', toolResult: 'Garrison Surgical Team Alpha activated — 12 surgeons + 2 ORs', timestamp: now() },
        { step: 3, phase: 'Complete', observation: 'Garrison confirmed — deploying to CMH and Civil Hospital', inference: 'Recovery successful', decision: 'Mark recovered — flag CMH API outage', timestamp: now() },
      ],
    },
    {
      id: 'qta-a3', crisisId: 'qta-c2', type: 'emergency_dispatch',
      title: 'Heating Supplies + Snowplough to N-25 Stranded Vehicles',
      description: 'Dispatch PDMA mobile unit with heating equipment and blankets. NHA snowplough to clear km-82.',
      status: 'completed', executedAt: now(), result: 'Heating supplies at site. Snowplough en route — ETA 4hr.',
      costPKR: 48000, latencyMs: 320,
      beforeState: { heatingOnSite: false, clearanceStarted: false }, afterState: { heatingOnSite: true, clearanceETA: '4hr' },
      trace: [{ step: 1, phase: 'Rescue', observation: '34 vehicles at -3°C, 6 buses with passengers — hypothermia risk in 2hr', inference: 'Heating is life-safety; snowplough clearance is secondary', decision: 'Priority 1: PDMA heating convoy. Priority 2: NHA snowplough dispatch', toolCalled: 'dispatch_api', toolResult: 'PDMA heating deployed + NHA snowplough dispatched', timestamp: now() }],
    },
  ];
}

export function getQuettaMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '🔴 EARTHQUAKE 5.8 — Quetta Emergency', body: 'Quetta mein M5.8 zalzala. Sariab, Wazir Muhammad Road: makaan chhod dain. Purani imartain khatarnak hain. Aftershock aa sakte hain. 1122 call karein. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'public', channel: 'sms', subject: '⚠️ N-25 MASTUNG BAND', body: 'N-25 highway Mastung pe band hai. Quetta se Karachi safar na karein. Stranded hain toh gaari mein rahain — PDMA heating aata hai. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: 'DEPLOY: Earthquake Response + N-25 Rescue', body: 'NDMA QTA-Alpha + Levies QL-07 → Sariab collapses. Garrison Surgical → CMH. PDMA heating → N-25 km-82. QTA-D02 drone → aerial damage assessment.', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
