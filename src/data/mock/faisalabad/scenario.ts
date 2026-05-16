import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getFaisalabadCrises(): Crisis[] {
  return [
    {
      id: 'fsd-c1',
      type: 'accident',
      title: 'Chlorine Gas Spill — Sitara Chemical D-Ground',
      location: { lat: 31.4195, lng: 73.0940, label: 'Sitara Chemical Plant, D-Ground', affectedRadiusKm: 0.8 },
      severity: 'high',
      confidenceScore: 0.92,
      confidenceHistory: [
        { t: '08:00', v: 0.58 }, { t: '08:18', v: 0.76 }, { t: '08:35', v: 0.92 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T08:00:00Z',
      estimatedDuration: '4-6 hours',
      affectedPopulation: 12000,
      spreadRisk: 'expanding',
      signalIds: ['fsd-s1', 'fsd-s2', 'fsd-f1', 'fsd-n1', 'fsd-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• fsd-s1 (social, credibility 0.74): D-Ground chemical smell + eye irritation. Velocity 21/min, 301 interactions.
• fsd-s2 (social, credibility 0.78): Chlorine fumes heading toward Susan Road. Velocity 27/min, 478 interactions — high urgency.
• fsd-f1 (field_report, credibility 0.93): Rescue 1122 confirms chlorine release, 400m exclusion zone, 47 workers evacuated, 8 hospitalised. VERIFICATION signal.
• fsd-n1 (sensor, credibility 0.88): PEECA sensor — 18 ppm chlorine (threshold: 1 ppm). 18× safe limit. Authoritative quantitative confirmation.
• fsd-t1 (traffic, credibility 0.80): Susan Road blocked by emergency vehicles — exclusion zone overlapping main artery.

Severity: HIGH — 18× safe chlorine threshold, exclusion zone established, workers hospitalised.
Confidence: 0.92 — Sensor reading + field verification + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'faisalabad',
    },
    {
      id: 'fsd-c2',
      type: 'heatwave',
      title: 'Clock Tower Blackout (80K Consumers) — 45°C Heatwave',
      location: { lat: 31.4180, lng: 73.0790, label: 'Clock Tower / People\'s Colony, Faisalabad', affectedRadiusKm: 4.0 },
      severity: 'high',
      confidenceScore: 0.89,
      confidenceHistory: [
        { t: '10:30', v: 0.62 }, { t: '11:00', v: 0.82 }, { t: '11:15', v: 0.89 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T10:30:00Z',
      estimatedDuration: '4-6 hours',
      affectedPopulation: 80000,
      spreadRisk: 'contained',
      signalIds: ['fsd-s3', 'fsd-s4', 'fsd-f2', 'fsd-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• fsd-s3 (social, credibility 0.70): 6-hour blackout in Clock Tower at 45°C — elderly/children at risk. Velocity 16/min, 212 interactions.
• fsd-s4 (social, credibility 0.74): 3 heatstroke patients at DHQ hospital from Clock Tower area. Medical confirmation.
• fsd-f2 (field_report, credibility 0.92): FESCO confirms 132kV feeder fault — 80,000 consumers affected, repair ETA 4 hours. VERIFICATION signal.
• fsd-w1 (weather, credibility 0.85): 45°C with 4km/h wind — extreme heat, no natural cooling.

Severity: HIGH — 80,000 without power at 45°C, heatstroke cases already presenting.
Confidence: 0.89 — FESCO field confirmation + hospital reports + weather corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'faisalabad',
    },
  ];
}

export function getFaisalabadActions(): Action[] {
  return [
    {
      id: 'fsd-a1',
      crisisId: 'fsd-c1',
      type: 'emergency_dispatch',
      title: 'HazMat Team + Ambulances to Sitara Chemical Plant',
      description: 'Deploy Rescue 1122 HazMat unit and Allied Hospital ambulances for worker extraction and chlorine containment.',
      status: 'completed',
      executedAt: now(),
      result: 'HazMat unit on scene. 8 workers in hospital. Containment in progress.',
      costPKR: 65000,
      latencyMs: 380,
      beforeState: { hazmatDeployed: false, workersEvacuated: 47 },
      afterState: { hazmatDeployed: true, hospitalised: 8, containmentStatus: 'in_progress' },
      trace: [
        { step: 1, phase: 'Assessment', observation: 'Chlorine 18× safe limit, 47 workers evacuated, 8 symptomatic', inference: 'HazMat containment + medical support both critical', decision: 'Co-deploy FH-03 HazMat + FSD-08 ambulances', toolCalled: 'dispatch_api', toolResult: 'HazMat + ambulances dispatched — ETA 6min', timestamp: now() },
      ],
    },
    {
      id: 'fsd-a2',
      crisisId: 'fsd-c1',
      type: 'public_alert',
      title: 'Shelter-In-Place Advisory — D-Ground / Susan Road',
      description: 'Issue shelter-in-place advisory for residents within 800m of Sitara Chemical Plant.',
      status: 'completed',
      executedAt: now(),
      result: 'Advisory delivered to 35,000 residents in exclusion zone.',
      costPKR: 18000,
      latencyMs: 160,
      beforeState: { shelterAlert: 'none' },
      afterState: { shelterAlert: 'active', residentsNotified: 35000 },
      trace: [
        { step: 1, phase: 'Alert', observation: 'Chlorine plume drifting SE toward Susan Road residential', inference: 'Outdoor exposure is dangerous — shelter-in-place preferred over evacuation (avoids plume exposure during transit)', decision: 'Issue bilingual shelter-in-place advisory', toolCalled: 'sms_gateway', toolResult: '35K SMS sent', timestamp: now() },
      ],
    },
    {
      id: 'fsd-a3',
      crisisId: 'fsd-c2',
      type: 'emergency_dispatch',
      title: 'Mobile Medical Units to Clock Tower Heatwave Zone',
      description: 'Deploy DHQ mobile health unit with ORS, cooling packs, and IV drips to Clock Tower area.',
      status: 'completed',
      executedAt: now(),
      result: 'DHQ FSD-2 deployed. Cooling station set up at Ghanta Ghar.',
      costPKR: 38000,
      latencyMs: 290,
      beforeState: { coolingStationsActive: 0 },
      afterState: { coolingStationsActive: 1, medicalUnitDeployed: true },
      trace: [
        { step: 1, phase: 'Triage', observation: '3 heatstroke cases in 30 minutes at 45°C with no power', inference: 'Proactive cooling station will prevent more casualties', decision: 'Deploy FSD-2 to Ghanta Ghar — set up public cooling point', toolCalled: 'dispatch_api', toolResult: 'Unit dispatched — ETA 10min', timestamp: now() },
      ],
    },
    {
      id: 'fsd-a4',
      crisisId: 'fsd-c2',
      type: 'utility_escalate',
      title: 'FESCO Priority Repair — Gulshan Colony 132kV Feeder',
      description: 'Escalate feeder fault repair to FESCO priority 1. Coordinate generator deployment to DHQ Hospital.',
      status: 'recovered',
      executedAt: now(),
      result: 'Repair crews expedited. Generator delivered to DHQ. Restoration ETA revised to 2.5 hours.',
      costPKR: 0,
      latencyMs: 1450,
      beforeState: { feederStatus: 'fault', repairETA: '4 hours' },
      afterState: { feederStatus: 'repair_in_progress', repairETA: '2.5 hours', hospitalGenerator: 'active' },
      trace: [
        { step: 1, phase: 'Attempt 1', observation: 'POST /priority-repair to FESCO Grid Management System', inference: 'System should escalate repair ticket', decision: 'Submit priority escalation', toolCalled: 'fesco_api', toolResult: 'HTTP 500 Internal Server Error', timestamp: now() },
        { step: 2, phase: 'Retry', observation: 'FESCO API returning 500 — likely under load', inference: 'Grid management system overwhelmed during heatwave', decision: 'Retry after 600ms backoff', toolCalled: 'fesco_api', toolResult: 'HTTP 500 again', timestamp: now() },
        { step: 3, phase: 'Recovery', observation: 'API unavailable — contact via emergency hotline', inference: 'Phone escalation is direct and reliable', decision: 'Trigger FESCO emergency hotline via telephony bridge', toolCalled: 'telephony_api', toolResult: 'Connected to FESCO Emergency Ops — repair expedited, generator dispatched', timestamp: now() },
        { step: 4, phase: 'Complete', observation: 'Verbal confirmation from FESCO Ops', inference: 'Recovery successful via alternate channel', decision: 'Mark recovered — log FESCO API outage for review', timestamp: now() },
      ],
    },
  ];
}

export function getFaisalabadMessages(): StakeholderMessage[] {
  return [
    {
      audience: 'public',
      channel: 'sms',
      subject: '⚠️ CHEMICAL ALERT — D-Ground / Susan Road',
      body: 'D-Ground / Susan Road: Chlorine gas leak. Ghar ke andar rahain, khidkiyan band karein. Bahar mat jayain. — CIRO Emergency',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'public',
      channel: 'sms',
      subject: '🔴 HEATWAVE + BLACKOUT — Clock Tower Area',
      body: 'Clock Tower, Jinnah Colony: Bijli nahi + 45°C garmi. Cooling station at Ghanta Ghar. Khub pani piyain. Budhe aur bachay ko dhup se bachayain. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'emergency_services',
      channel: 'dashboard',
      subject: 'DEPLOY: HazMat + Heatwave Response',
      body: 'FH-03 HazMat → Sitara Chemical. FSD-08 ambulances → D-Ground workers. FSD-2 mobile → Ghanta Ghar cooling. Traffic FP-14 → Susan Road diversion.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
  ];
}
