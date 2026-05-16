import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getGwadarCrises(): Crisis[] {
  return [
    {
      id: 'gwd-c1',
      type: 'flood',
      title: 'Cyclone YUKI Landfall — Coastal Evacuation Emergency',
      location: { lat: 25.1300, lng: 62.3350, label: 'Koh-e-Batil, Gwadar Coast', affectedRadiusKm: 8.0 },
      severity: 'critical',
      confidenceScore: 0.99,
      confidenceHistory: [{ t: '10:00', v: 0.85 }, { t: '10:15', v: 0.95 }, { t: '10:25', v: 0.99 }],
      status: 'active',
      detectedAt: '2026-05-20T10:00:00Z',
      estimatedDuration: '12-24 hours',
      affectedPopulation: 85000,
      spreadRisk: 'expanding',
      signalIds: ['gwd-s1', 'gwd-s2', 'gwd-f1', 'gwd-n1', 'gwd-t1', 'gwd-e1', 'gwd-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• gwd-s1 (social, credibility 0.83): Cyclone YUKI, storm surge in fishing colony. Velocity 34/min, 1,201 interactions.
• gwd-s2 (social, credibility 0.85): Category 2, 3.5m surge, port + airport closed. Velocity 41/min, 1,801 interactions.
• gwd-f1 (field_report, credibility 0.97): PMD Cyclone Warning Centre — 130km/h winds, 3.2-3.8m surge, landfall imminent. Highest-authority verification.
• gwd-n1 (sensor, credibility 0.94): PCG buoy — 4.8m waves, 948 hPa (extreme low pressure), 128km/h winds measured. Quantitative storm confirmation.
• gwd-t1 (traffic, credibility 0.80): Coastal Highway 2km/h — mass evacuation gridlock.
• gwd-e1 (emergency_call, credibility 0.93): PCG — 48 evacuation requests, fishing colony unable to self-evacuate.
• gwd-w1 (weather, credibility 0.85): Landfall in 3-4 hours — time-critical.

Severity: CRITICAL — Category 2 cyclone, 3.5m storm surge, 85K residents, landfall imminent.
Confidence: 0.99 — PMD official warning + buoy sensor + PCG emergency calls + mass social confirmation.`,
      actions: [],
      stakeholderMessages: [],
      city: 'gwadar',
    },
    {
      id: 'gwd-c2',
      type: 'disease_cluster',
      title: 'Chronic Water Scarcity — 34 Days No Piped Supply, Dysentery Cases',
      location: { lat: 25.1216, lng: 62.3254, label: 'Gwadar City', affectedRadiusKm: 10.0 },
      severity: 'high',
      confidenceScore: 0.92,
      confidenceHistory: [{ t: '08:00', v: 0.70 }, { t: '08:30', v: 0.92 }],
      status: 'active',
      detectedAt: '2026-05-20T08:00:00Z',
      estimatedDuration: '7-30 days',
      affectedPopulation: 85000,
      spreadRisk: 'expanding',
      signalIds: ['gwd-s3', 'gwd-f2'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• gwd-s3 (social, credibility 0.70): 1 month no piped water, tanker mafia pricing. Velocity 14/min, 245 interactions.
• gwd-f2 (field_report, credibility 0.94): GDA — reservoir 4%, 34 days no pipe, 120L/family/week (34% of minimum), dysentery rising. VERIFICATION signal.

Severity: HIGH — chronic public health crisis, dysentery confirmed, 85K affected, pre-cyclone compound risk.
Confidence: 0.92 — GDA official declaration + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'gwadar',
    },
  ];
}

export function getGwadarActions(): Action[] {
  return [
    {
      id: 'gwd-a1', crisisId: 'gwd-c1', type: 'emergency_dispatch',
      title: 'PCG + NDMA Evacuation — Koh-e-Batil Fishing Colony',
      description: 'Deploy PCG rescue boats and NDMA teams to evacuate fishing colony residents who cannot self-evacuate.',
      status: 'completed', executedAt: now(), result: '340 coastal residents evacuated. 6 buses dispatched inland.',
      costPKR: 180000, latencyMs: 520,
      beforeState: { coastalResidentsEvacuated: 0 }, afterState: { coastalResidentsEvacuated: 340, busesDispatched: 6 },
      trace: [
        { step: 1, phase: 'Priority Triage', observation: '48 evacuation requests — fishing colony immobile, landfall in 3hr', inference: 'Boat + bus combination is the only way to evacuate 340 people in time', decision: 'PCG Alpha boats for offshore/waterlogged; NDMA buses for accessible residents', toolCalled: 'dispatch_api', toolResult: 'PCG Alpha + 6 buses dispatched — ETA 15min to colony', timestamp: now() },
      ],
    },
    {
      id: 'gwd-a2', crisisId: 'gwd-c1', type: 'public_alert',
      title: 'Cyclone YUKI Mass Evacuation Order — Coastal 5km Zone',
      description: 'Issue mandatory evacuation order for all residents within 5km of coastline.',
      status: 'completed', executedAt: now(), result: 'Evacuation SMS sent to 85,000 residents. Relief camps activated at stadium.',
      costPKR: 42000, latencyMs: 280,
      beforeState: { evacuationOrder: 'none' }, afterState: { evacuationOrder: 'mandatory', residentsNotified: 85000 },
      trace: [
        { step: 1, phase: 'Alert', observation: 'Landfall in 3-4 hours, 3.5m storm surge will inundate all coastal areas', inference: 'Every resident within 5km is at life risk from storm surge alone', decision: 'Issue mandatory evacuation order — Coastal Highway inland, Relief camp at Gwadar Stadium', toolCalled: 'sms_gateway', toolResult: '85K evacuation SMS sent', timestamp: now() },
      ],
    },
    {
      id: 'gwd-a3', crisisId: 'gwd-c2', type: 'utility_escalate',
      title: 'Emergency Water Tanker Fleet — Pre-Cyclone Distribution',
      description: 'Distribute emergency water before cyclone landfall makes roads impassable. Coordinate with GDA.',
      status: 'completed', executedAt: now(), result: '8 GDA tankers distributed 240,000L across 12 distribution points.',
      costPKR: 95000, latencyMs: 340,
      beforeState: { emergencyWaterDistributed: 0 }, afterState: { emergencyWaterDistributed: 240000, distributionPoints: 12 },
      trace: [
        { step: 1, phase: 'Pre-positioning', observation: 'Cyclone will make roads impassable in 3hr — water shortage already critical', inference: 'Pre-position maximum water now while roads are still open', decision: 'Deploy all 8 GDA tankers to 12 neighbourhood distribution points pre-landfall', toolCalled: 'gda_api', toolResult: '8 tankers dispatched — 240K litres pre-positioned', timestamp: now() },
      ],
    },
  ];
}

export function getGwadarMessages(): StakeholderMessage[] {
  return [
    { audience: 'public', channel: 'sms', subject: '🔴 CYCLONE YUKI — FORAN GHAR CHHODAIN', body: 'Gwadar: Cyclone YUKI ata hai! 5km sahil se andar rahne wale FORAN nikal jayain. Gwadar Stadium mein shelter hai. Gaarian Coastal Highway se andar jayain. — CIRO', sentAt: now(), status: 'delivered', isRetraction: false },
    { audience: 'emergency_services', channel: 'dashboard', subject: 'CYCLONE EVAC: PCG + NDMA Deploy', body: 'PCG Alpha boats → Koh-e-Batil fishing colony. 6 buses → coastal settlements. GDA tankers → pre-position water. GWD-D01 drone → post-landfall damage assessment (grounded during storm).', sentAt: now(), status: 'delivered', isRetraction: false },
  ];
}
