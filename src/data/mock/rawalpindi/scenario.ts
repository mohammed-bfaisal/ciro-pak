import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getRawalpindiCrises(): Crisis[] {
  return [
    {
      id: 'rwp-c1',
      type: 'flood',
      title: 'Leh Nullah Breach — Families Stranded Peshawar Morr',
      location: { lat: 33.6200, lng: 72.9900, label: 'Leh Nullah, Peshawar Morr', affectedRadiusKm: 3.5 },
      severity: 'critical',
      confidenceScore: 0.93,
      confidenceHistory: [
        { t: '06:30', v: 0.58 }, { t: '06:48', v: 0.75 }, { t: '07:00', v: 0.88 }, { t: '07:30', v: 0.93 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T06:30:00Z',
      estimatedDuration: '8-12 hours',
      affectedPopulation: 18000,
      spreadRisk: 'expanding',
      signalIds: ['rwp-s1', 'rwp-s2', 'rwp-f1', 'rwp-t1', 'rwp-e1'],
      conflictingSignalIds: ['rwp-s3'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• rwp-s1 (social, credibility 0.79): Leh Nullah overflow near Peshawar Morr with families on rooftops. High velocity (28/min), 520 interactions.
• rwp-s2 (social, credibility 0.82): Saddar inundation + Murree Road submerged. Very high velocity (33/min), 633 interactions.
• rwp-s3 (social, credibility 0.06): FLAGGED — "Thoda sa paani" (just a little water). Posted 20min before major reports, zero velocity, 1 like. DOWN-RANKED.
• rwp-f1 (field_report, credibility 0.94): NDMA confirms breach at bridge abutment, 1.6m above danger mark, 180 families displaced. 3 boats deployed. VERIFICATION signal.
• rwp-t1 (traffic, credibility 0.80): Murree Road speed 0km/h confirms full blockage.
• rwp-e1 (emergency_call, credibility 0.91): 38 rescue calls in 90min, 12 confirmed rooftop strandings.

Severity: CRITICAL — 1.6m above danger mark, 180 families displaced, active rescue operation.
Confidence: 0.93 — NDMA field verification + emergency call data + traffic corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'rawalpindi',
    },
    {
      id: 'rwp-c2',
      type: 'infrastructure',
      title: 'SNGPL Gas Pipeline Rupture — Raja Bazaar / Liaquat Bagh',
      location: { lat: 33.6055, lng: 73.0615, label: 'Liaquat Bagh, Rawalpindi', affectedRadiusKm: 0.5 },
      severity: 'high',
      confidenceScore: 0.91,
      confidenceHistory: [
        { t: '08:10', v: 0.65 }, { t: '08:25', v: 0.80 }, { t: '08:30', v: 0.91 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T08:10:00Z',
      estimatedDuration: '2-4 hours',
      affectedPopulation: 5000,
      spreadRisk: 'contained',
      signalIds: ['rwp-s4', 'rwp-s5', 'rwp-f2'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• rwp-s4 (social, credibility 0.73): Gas smell at Raja Bazaar, SNGPL unreachable. Velocity 19/min, 379 interactions.
• rwp-s5 (social, credibility 0.76): Area evacuated 200m, SNGPL on-scene. Velocity 14/min, 285 interactions.
• rwp-f2 (field_report, credibility 0.95): SNGPL confirms 4-inch pipeline rupture. Cut-off valve activated, isolation in 45min. VERIFICATION signal.

Severity: HIGH — active gas leak, 200m evacuation zone, explosion risk until isolated.
Confidence: 0.91 — SNGPL field confirmation + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'rawalpindi',
    },
  ];
}

export function getRawalpindiActions(): Action[] {
  return [
    {
      id: 'rwp-a1',
      crisisId: 'rwp-c1',
      type: 'emergency_dispatch',
      title: 'Deploy Rescue Boats + Teams to Leh Nullah Breach',
      description: 'Dispatch Rescue 1122 RWP-Alpha with inflatable boats to evacuate families stranded in Dhoke Syedan and Peshawar Morr.',
      status: 'completed',
      executedAt: now(),
      result: '3 boats + 12-person team deployed. ETA 8 minutes.',
      costPKR: 55000,
      latencyMs: 340,
      beforeState: { rescueBoatsDeployed: 0 },
      afterState: { rescueBoatsDeployed: 3, familiesEvacuated: 0, inProgress: true },
      trace: [
        { step: 1, phase: 'Planning', observation: '12 families confirmed stranded on rooftops, water 1.6m above danger', inference: 'Boat rescue is the only viable extraction method', decision: 'Dispatch RWP-Alpha with 3 inflatable boats', toolCalled: 'dispatch_api', toolResult: 'RWP-Alpha dispatched — ETA 8min', timestamp: now() },
      ],
    },
    {
      id: 'rwp-a2',
      crisisId: 'rwp-c1',
      type: 'public_alert',
      title: 'Flood Evacuation Warning — Peshawar Morr / Saddar',
      description: 'Issue emergency SMS evacuation warning for Leh Nullah catchment areas.',
      status: 'completed',
      executedAt: now(),
      result: 'Warning SMS sent to 85,000 residents in affected zones.',
      costPKR: 42000,
      latencyMs: 210,
      beforeState: { evacuationAlert: 'none' },
      afterState: { evacuationAlert: 'active', residentsNotified: 85000 },
      trace: [
        { step: 1, phase: 'Alert', observation: 'Leh Nullah expanding — Saddar next in path', inference: 'Proactive evacuation prevents further strandings', decision: 'Issue evacuation SMS to Peshawar Morr, Saddar, Dhoke Syedan', toolCalled: 'sms_gateway', toolResult: '85K SMS queued', timestamp: now() },
      ],
    },
    {
      id: 'rwp-a3',
      crisisId: 'rwp-c2',
      type: 'utility_escalate',
      title: 'SNGPL Gas Isolation — Liaquat Bagh Pipeline',
      description: 'Escalate to SNGPL to expedite cut-off valve closure. Coordinate police evacuation perimeter.',
      status: 'completed',
      executedAt: now(),
      result: 'SNGPL cut-off in progress. Police perimeter 200m established.',
      costPKR: 0,
      latencyMs: 290,
      beforeState: { gasIsolated: false, evacuationPerimeter: 0 },
      afterState: { gasIsolated: 'in_progress', evacuationPerimeter: 200 },
      trace: [
        { step: 1, phase: 'Escalation', observation: 'Active gas leak, cut-off valve not yet closed', inference: 'Every minute of delay increases explosion risk', decision: 'Expedite SNGPL isolation + expand police perimeter to 200m', toolCalled: 'sngpl_api', toolResult: 'Isolation valve confirmed engaged — ETA 45min', timestamp: now() },
      ],
    },
  ];
}

export function getRawalpindiMessages(): StakeholderMessage[] {
  return [
    {
      audience: 'public',
      channel: 'sms',
      subject: '🔴 FLOOD EVACUATION — Leh Nullah Overflow',
      body: 'Peshawar Morr, Saddar, Dhoke Syedan: Leh Nullah breach. Abhi ghar khali karein. Rescue 1122 madad ke liye 1122 call karein. Upar wale manzil par rahain. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'public',
      channel: 'sms',
      subject: '⚠️ GAS LEAK — Raja Bazaar / Liaquat Bagh',
      body: 'Raja Bazaar / Liaquat Bagh: Gas pipeline leak. 200 metre ilaqay se nikal jayain. Koi cheez mat jalayain. SNGPL kaam kar raha hai. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'emergency_services',
      channel: 'dashboard',
      subject: 'DISPATCH: Flood Rescue + Gas Response',
      body: 'Rescue RWP-Alpha → Leh Nullah boats. NDMA → Peshawar Morr. Traffic RP-07 → Murree Road diversion. RF-09 standby at gas leak perimeter. SNGPL isolation in progress.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
  ];
}
