import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getKarachiCrises(): Crisis[] {
  return [
    {
      id: 'khi-c1',
      type: 'flood',
      title: 'Lyari Riverbank Breach — Chakiwara',
      location: {
        lat: 24.8614,
        lng: 67.0022,
        label: 'Lyari Riverbank, Chakiwara',
        affectedRadiusKm: 2.5,
      },
      severity: 'critical',
      confidenceScore: 0.91,
      confidenceHistory: [
        { t: '07:45', v: 0.55 },
        { t: '07:58', v: 0.68 },
        { t: '08:05', v: 0.74 },
        { t: '08:10', v: 0.91 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T07:45:00Z',
      estimatedDuration: '6-12 hours',
      affectedPopulation: 12000,
      spreadRisk: 'expanding',
      signalIds: ['khi-s1', 'khi-s2', 'khi-f1', 'khi-w1', 'khi-t1'],
      conflictingSignalIds: ['khi-s3'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• khi-s1 (social, credibility 0.72): Reports flooding in Lyari with high urgency (0.93) and strong mention velocity (18/min). Corroborated by khi-s2.
• khi-s2 (social, credibility 0.78): Confirms riverbank breach at Chakiwara specifically. High engagement (313 interactions) boosts credibility.
• khi-s3 (social, credibility 0.12): FLAGGED — Claims area is normal. However: posted 33 minutes before breach reports, zero engagement (0 likes, 0 retweets), zero mention velocity. Credibility score 0.12 after age penalty (-0.25) and zero engagement penalty (-0.20). This signal is classified as CONTRADICTORY and DOWN-RANKED.
• khi-f1 (field_report, credibility 0.94): PDMA field unit CONFIRMS breach at 3 points. Water 1.8m above danger mark. 200 families affected. This is the VERIFICATION signal.
• khi-w1 (weather, credibility 0.85): 38mm/hr rainfall corroborates flooding conditions.
• khi-t1 (traffic, credibility 0.80): Lyari Expressway at 3km/h (normal 60km/h) confirms road flooding.

Crisis Classification Decision:
Initially classified as "general urban flooding" based on social signals alone. REFINED to "riverbank breach — localised to Chakiwara" after field report khi-f1 clarified scope. This refinement triggers a FALSE ALARM CORRECTION for the initial city-wide flood alert.

Severity: CRITICAL — water 1.8m above danger mark, 200 families displaced, expanding risk.
Confidence: 0.91 — 5 corroborating signals vs 1 low-credibility contradicting signal.`,
      actions: [],
      stakeholderMessages: [],
      city: 'karachi',
    },
    {
      id: 'khi-c2',
      type: 'heatwave',
      title: 'DHA Phase 8 Heat Emergency + Power Outage',
      location: {
        lat: 24.7971,
        lng: 67.0747,
        label: 'DHA Phase 8, Karachi',
        affectedRadiusKm: 3.0,
      },
      severity: 'high',
      confidenceScore: 0.87,
      confidenceHistory: [
        { t: '08:30', v: 0.62 },
        { t: '08:44', v: 0.78 },
        { t: '09:05', v: 0.87 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T08:30:00Z',
      estimatedDuration: '4-6 hours',
      affectedPopulation: 35000,
      spreadRisk: 'contained',
      signalIds: ['khi-s4', 'khi-s5', 'khi-f2'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• khi-s4 (social, credibility 0.68): Reports elderly hospitalisation due to extreme heat + 6-hour power outage. Moderate engagement (90 interactions on Facebook).
• khi-s5 (social, credibility 0.74): Hospital source confirms 4 heatstroke patients, 2 critical. High engagement (212 interactions) and medical context boosts credibility.
• khi-f2 (field_report, credibility 0.91): NEPRA inspector confirms transformer overload from AC demand spike. Estimated 4-6 hour repair.

Crisis Classification Decision:
Compound crisis: HEATWAVE conditions exacerbated by POWER OUTAGE. Without AC during extreme heat, vulnerable populations (elderly, children) are at high risk. The power outage is the catalyst converting a weather event into a medical emergency.

Severity: HIGH — active hospitalisations, 35K population affected, but contained to DHA Phase 8 grid area.
Confidence: 0.87 — 3 signals, no contradictions, field verification from NEPRA.`,
      actions: [],
      stakeholderMessages: [],
      city: 'karachi',
    },
  ];
}

export function getKarachiActions(): Action[] {
  return [
    {
      id: 'a1',
      crisisId: 'khi-c1',
      type: 'emergency_dispatch',
      title: 'Deploy NDMA Rescue to Lyari Breach',
      description: 'Dispatch 2 rescue teams + 1 ambulance to Chakiwara breach points for evacuation of 200 displaced families.',
      status: 'completed',
      executedAt: now(),
      result: '3 units dispatched successfully. ETA 18 minutes.',
      costPKR: 45000,
      latencyMs: 320,
      beforeState: { rescueUnitsAvailable: 2, ambulancesAvailable: 1 },
      afterState: { rescueUnitsAvailable: 0, ambulancesAvailable: 0, unitsDispatched: 3 },
      trace: [
        { step: 1, phase: 'Planning', observation: 'Crisis khi-c1 severity CRITICAL, 200 families', inference: 'Maximum rescue priority', decision: 'Dispatch all available rescue units to Chakiwara', timestamp: now() },
        { step: 2, phase: 'Execution', observation: 'Units Alpha and Bravo available', inference: 'Both within 8km radius', decision: 'Route via M.A. Jinnah Road (avoid flooded Lyari Expressway)', toolCalled: 'dispatch_api', toolResult: 'Units dispatched — ETA 18min', timestamp: now() },
      ],
    },
    {
      id: 'a2',
      crisisId: 'khi-c1',
      type: 'public_alert',
      title: 'Lyari Flood Warning SMS Broadcast',
      description: 'Emergency SMS to 50,000 residents in Lyari area warning of riverbank breach and advising evacuation routes.',
      status: 'completed',
      executedAt: now(),
      result: 'SMS broadcast queued — 50,000 recipients. Delivery rate: 94%.',
      costPKR: 25000,
      latencyMs: 180,
      beforeState: { publicAlertStatus: 'none', residentsNotified: 0 },
      afterState: { publicAlertStatus: 'active', residentsNotified: 50000, deliveryRate: 0.94 },
      trace: [
        { step: 1, phase: 'Drafting', observation: 'Flood breach at Chakiwara confirmed', inference: 'Public needs immediate evacuation guidance', decision: 'Draft Urdu + English SMS with evacuation routes', timestamp: now() },
        { step: 2, phase: 'Delivery', observation: 'SMS gateway ready', inference: 'Broadcast to Lyari cell towers', decision: 'Send via emergency broadcast channel', toolCalled: 'sms_gateway', toolResult: '50,000 queued — 94% delivered', timestamp: now() },
      ],
    },
    {
      id: 'a3',
      crisisId: 'khi-c1',
      type: 'hospital_notify',
      title: 'Alert Nearby Hospitals — Mass Casualty Prep',
      description: 'Notify Jinnah Hospital and Civil Hospital to activate flood emergency protocol — prepare for waterborne disease cases.',
      status: 'completed',
      executedAt: now(),
      result: 'Both hospitals acknowledged — emergency beds allocated.',
      costPKR: 0,
      latencyMs: 95,
      beforeState: { hospitalAlertLevel: 'normal' },
      afterState: { hospitalAlertLevel: 'emergency', bedsAllocated: 40 },
      trace: [
        { step: 1, phase: 'Notification', observation: 'Flood with potential casualties', inference: 'Hospitals need advance warning', decision: 'Send hospital alert via dashboard + email', toolCalled: 'hospital_api', toolResult: 'ACK from Jinnah + Civil Hospital', timestamp: now() },
      ],
    },
    {
      id: 'a4',
      crisisId: 'khi-c2',
      type: 'emergency_dispatch',
      title: 'Deploy Medical Outreach to DHA Phase 8',
      description: 'Send AKUH Mobile Medical Unit to DHA Phase 8 for heatstroke treatment on-site.',
      status: 'completed',
      executedAt: now(),
      result: 'Medical unit dispatched. ETA 12 minutes.',
      costPKR: 30000,
      latencyMs: 210,
      beforeState: { medicalUnitsAvailable: 1 },
      afterState: { medicalUnitsAvailable: 0, medicalUnitDispatched: true },
      trace: [
        { step: 1, phase: 'Assessment', observation: '4 heatstroke patients, 2 critical', inference: 'On-site medical care needed', decision: 'Dispatch AKUH mobile unit with IV fluids and cooling equipment', toolCalled: 'dispatch_api', toolResult: 'Unit dispatched — ETA 12min', timestamp: now() },
      ],
    },
    {
      id: 'a5',
      crisisId: 'khi-c2',
      type: 'utility_escalate',
      title: 'NEPRA Emergency Power Restoration',
      description: 'Escalate DHA Phase 8 grid failure to K-Electric priority queue for emergency transformer repair.',
      status: 'completed',
      executedAt: now(),
      result: 'K-Electric team dispatched. Estimated restoration: 2 hours (down from 4-6).',
      costPKR: 0,
      latencyMs: 150,
      beforeState: { powerStatus: 'outage', estimatedRepair: '4-6 hours' },
      afterState: { powerStatus: 'repair_in_progress', estimatedRepair: '2 hours', priorityEscalated: true },
      trace: [
        { step: 1, phase: 'Escalation', observation: 'Power outage causing medical emergency', inference: 'Standard repair timeline too slow', decision: 'Escalate to NEPRA emergency protocol', toolCalled: 'utility_api', toolResult: 'K-Electric priority repair team dispatched', timestamp: now() },
      ],
    },
    {
      id: 'a6',
      crisisId: 'khi-c1',
      type: 'alert_retraction',
      title: 'Retract City-Wide Flood Alert → Localised Breach',
      description: 'Initial SMS overstated scope as city-wide flooding. Field report khi-f1 confirms breach is localised to Chakiwara only. Send retraction + corrected alert.',
      status: 'completed',
      executedAt: now(),
      result: 'Retraction SMS sent to 50,000. Corrected scope: Chakiwara area only.',
      costPKR: 12000,
      latencyMs: 200,
      beforeState: { alertScope: 'city_wide_flood', publicConfusion: 'high' },
      afterState: { alertScope: 'localised_breach_chakiwara', publicConfusion: 'resolved', retractionSent: true },
      trace: [
        { step: 1, phase: 'Review', observation: 'Initial alert said city-wide flooding', inference: 'Field report khi-f1 says localised breach only', decision: 'Issue retraction to prevent unnecessary panic', timestamp: now() },
        { step: 2, phase: 'Correction', observation: 'Retraction drafted', inference: 'Must reach same 50K audience', decision: 'Send via same SMS channel with CORRECTION prefix', toolCalled: 'sms_gateway', toolResult: 'Retraction delivered — 96% delivery rate', timestamp: now() },
      ],
    },
    {
      id: 'a7',
      crisisId: 'khi-c1',
      type: 'traffic_reroute',
      title: 'Activate Mauripur Road Diversion',
      description: 'Reroute Lyari Expressway traffic via Mauripur Road to avoid flooded sections. Requires Smart City traffic API.',
      status: 'recovered',
      executedAt: now(),
      result: 'Diversion activated via cached fallback after API failure. 3 diversion waypoints applied.',
      costPKR: 0,
      latencyMs: 1840,
      beforeState: { mauripurRoad: 'unmonitored' },
      afterState: { mauripurRoad: 'diversion_active', source: 'cached_fallback' },
      trace: [
        {
          step: 1,
          phase: 'Attempt 1',
          observation: 'POST /routes/divert to Smart City API',
          inference: 'API should be available',
          decision: 'Execute call',
          toolCalled: 'traffic_api',
          toolResult: 'HTTP 503 Service Unavailable',
          timestamp: now(),
        },
        {
          step: 2,
          phase: 'Retry',
          observation: 'HTTP 503 on attempt 1',
          inference: 'API temporarily down — common during emergencies',
          decision: 'Retry with 500ms backoff',
          toolCalled: 'traffic_api',
          toolResult: 'HTTP 503 again',
          timestamp: now(),
        },
        {
          step: 3,
          phase: 'Recovery',
          observation: 'Both attempts failed',
          inference: 'API unstable — use cached fallback',
          decision: 'Load mauripur_diversion_v2.json from cache',
          toolCalled: 'cache_store',
          toolResult: 'Loaded successfully — 3 diversion waypoints',
          timestamp: now(),
        },
        {
          step: 4,
          phase: 'Complete',
          observation: 'Diversion config applied',
          inference: 'Recovery successful',
          decision: 'Mark action as recovered, flag for post-incident review',
          timestamp: now(),
        },
      ],
    },
  ];
}

export function getKarachiMessages(): StakeholderMessage[] {
  return [
    {
      audience: 'public',
      channel: 'sms',
      subject: '⚠️ EMERGENCY: Lyari Riverbank Breach',
      body: 'Lyari/Chakiwara: Riverbank breach confirmed. Avoid area. Follow evacuation routes via Mauripur Road. Stay tuned for updates. — CIRO Emergency System',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'emergency_services',
      channel: 'dashboard',
      subject: 'DISPATCH ORDER: Lyari Breach — 3 Units',
      body: 'NDMA Alpha + Bravo + Edhi KHI-07 dispatched to Chakiwara breach. Route: M.A. Jinnah Road. ETA 18min. Coordinate with PDMA Field Unit 3 on-site.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'hospitals',
      channel: 'email',
      subject: 'MASS CASUALTY ALERT: Flood + Heat Emergency',
      body: 'Jinnah Hospital & Civil Hospital: Activate flood protocol. Prepare 40 emergency beds. Expect waterborne disease cases from Lyari + heatstroke from DHA Phase 8. AKUH mobile unit deployed.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'utility_company',
      channel: 'dashboard',
      subject: 'PRIORITY: DHA Phase 8 Grid Restoration',
      body: 'K-Electric: Transformer overload at DHA Phase 8 grid station causing medical emergency (heatstroke cases). NEPRA emergency protocol activated. Requested timeline: 2 hours max.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'transport_authority',
      channel: 'dashboard',
      subject: 'TRAFFIC DIVERSION: Lyari Expressway → Mauripur Road',
      body: 'Lyari Expressway closed due to flooding. All traffic diverted via Mauripur Road. Smart City API unavailable — using cached diversion config. Manual traffic police deployment recommended at junction points.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'media',
      channel: 'email',
      subject: 'CORRECTION: Lyari Incident Is Localised Breach, Not City-Wide Flood',
      body: 'Previous reports of city-wide flooding are INCORRECT. The incident is a localised riverbank breach at Chakiwara, Lyari. Approximately 200 families affected. Rescue operations underway. Do NOT report as city-wide flooding.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: true,
    },
  ];
}
