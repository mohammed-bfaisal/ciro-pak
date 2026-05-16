import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getLahoreCrises(): Crisis[] {
  return [
    {
      id: 'lhr-c1',
      type: 'disease_cluster',
      title: 'Lahore Smog Emergency — AQI 523 (Hazardous)',
      location: { lat: 31.5080, lng: 74.3350, label: 'Canal Road, Lahore', affectedRadiusKm: 15.0 },
      severity: 'critical',
      confidenceScore: 0.94,
      confidenceHistory: [
        { t: '07:30', v: 0.60 }, { t: '08:00', v: 0.82 }, { t: '08:05', v: 0.88 }, { t: '08:50', v: 0.94 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T07:30:00Z',
      estimatedDuration: '18-36 hours',
      affectedPopulation: 1200000,
      spreadRisk: 'expanding',
      signalIds: ['lhr-s1', 'lhr-s2', 'lhr-s5', 'lhr-f1', 'lhr-e1'],
      conflictingSignalIds: ['lhr-s3'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• lhr-s1 (social, credibility 0.77): Canal Road AQI 520+ report. High velocity (24/min) + strong engagement (421 interactions).
• lhr-s2 (social, credibility 0.82): PEEF school closure order confirms AQI 523. Very high velocity (31/min), 754 interactions.
• lhr-s3 (social, credibility 0.07): FLAGGED — Claims smog is exaggerated. Posted 35 min before peak reports, zero velocity, 2 likes. DOWN-RANKED as stale/unverified contradictory signal.
• lhr-s5 (social, credibility 0.78): Services Hospital emergency overload with respiratory cases confirms city-wide health impact.
• lhr-f1 (field_report, credibility 0.93): Punjab EPA Unit 4 confirms AQI 523 PM2.5. Visibility 120m. Crop burning confirmed.
• lhr-e1 (emergency_call, credibility 0.90): 1122 dispatch — 47 calls/hour (380% above baseline). Respiratory emergencies city-wide.

Severity: CRITICAL — AQI 523 (hazardous), 1.2M exposed, schools closed, hospital surge confirmed.
Confidence: 0.94 — EPA verification + emergency call spike + social corroboration vs 1 low-credibility denial.`,
      actions: [],
      stakeholderMessages: [],
      city: 'lahore',
    },
    {
      id: 'lhr-c2',
      type: 'flood',
      title: 'Liberty Market Urban Flooding — Drain Overflow',
      location: { lat: 31.5100, lng: 74.3500, label: 'Liberty Market / MM Alam Road', affectedRadiusKm: 2.0 },
      severity: 'high',
      confidenceScore: 0.87,
      confidenceHistory: [
        { t: '09:15', v: 0.61 }, { t: '09:30', v: 0.87 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T09:15:00Z',
      estimatedDuration: '4-8 hours',
      affectedPopulation: 22000,
      spreadRisk: 'contained',
      signalIds: ['lhr-s4', 'lhr-f2', 'lhr-t1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• lhr-s4 (social, credibility 0.72): Liberty Market flooding with knee-deep water. Velocity 17/min, 250 interactions — credible.
• lhr-f2 (field_report, credibility 0.91): Rescue 1122 on-ground: 45cm water depth, WASA pumping teams en route. Verified.
• lhr-t1 (traffic, credibility 0.80): Canal Road / Jail Road speed 1km/h (normal 50km/h) — confirms area impassable.

Severity: HIGH — 45cm water depth, main commercial artery blocked, businesses flooded.
Confidence: 0.87 — Field verification + traffic data + social corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'lahore',
    },
  ];
}

export function getLahoreActions(): Action[] {
  return [
    {
      id: 'lhr-a1',
      crisisId: 'lhr-c1',
      type: 'public_alert',
      title: 'Mass SMS Alert — Smog Health Emergency',
      description: 'Issue city-wide bilingual SMS advisory for AQI 523. Advise staying indoors, mask use, school closures.',
      status: 'completed',
      executedAt: now(),
      result: 'Advisory SMS sent to 1.4M Lahore residents.',
      costPKR: 140000,
      latencyMs: 320,
      beforeState: { healthAdvisory: 'none' },
      afterState: { healthAdvisory: 'active', residentsNotified: 1400000 },
      trace: [
        { step: 1, phase: 'Drafting', observation: 'AQI 523 — hazardous threshold exceeded', inference: 'Mass public health emergency', decision: 'Draft bilingual Urdu/English advisory', toolCalled: 'sms_gateway', toolResult: '1.4M SMS queued for delivery', timestamp: now() },
      ],
    },
    {
      id: 'lhr-a2',
      crisisId: 'lhr-c1',
      type: 'emergency_dispatch',
      title: 'Deploy PGMI Mobile Units to Canal Road & Services Hospital',
      description: 'Send mobile health units to manage respiratory surge at Canal Road and supplement Services Hospital intake.',
      status: 'completed',
      executedAt: now(),
      result: 'PGMI Unit Punjab-3 deployed. ETA 12 minutes.',
      costPKR: 45000,
      latencyMs: 410,
      beforeState: { mobileUnitsAvailable: 1 },
      afterState: { mobileUnitsAvailable: 0, unitsDeployed: 1 },
      trace: [
        { step: 1, phase: 'Assessment', observation: 'Services Hospital ER overloaded, 47 emergency calls/hour', inference: 'On-site respiratory care + hospital supplement needed', decision: 'Deploy PGMI mobile unit with nebulisers and oxygen tanks', toolCalled: 'dispatch_api', toolResult: 'PGMI Punjab-3 dispatched — ETA 12min', timestamp: now() },
      ],
    },
    {
      id: 'lhr-a3',
      crisisId: 'lhr-c2',
      type: 'utility_escalate',
      title: 'WASA Dewatering — Liberty Market Drain Overflow',
      description: 'Escalate drain overflow to WASA emergency dewatering. Deploy LP-03 pump truck to Hussain Chowk.',
      status: 'completed',
      executedAt: now(),
      result: 'WASA LP-03 dispatched. Dewatering begins in 20 minutes.',
      costPKR: 28000,
      latencyMs: 180,
      beforeState: { drainStatus: 'overflowing' },
      afterState: { drainStatus: 'dewatering_in_progress', estimatedClearance: '4 hours' },
      trace: [
        { step: 1, phase: 'Escalation', observation: 'Storm drain overflow — 45cm water depth', inference: 'WASA dewatering is the immediate fix', decision: 'Dispatch LP-03 pump truck to Liberty Market', toolCalled: 'wasa_api', toolResult: 'LP-03 dispatched — ETA 20min', timestamp: now() },
      ],
    },
    {
      id: 'lhr-a4',
      crisisId: 'lhr-c2',
      type: 'traffic_reroute',
      title: 'Divert MM Alam Road Traffic via Gulberg III',
      description: 'Reroute Liberty Market / MM Alam Road traffic via Gulberg III main boulevard and Ferozepur Road.',
      status: 'completed',
      executedAt: now(),
      result: 'Diversion activated on navigation apps.',
      costPKR: 0,
      latencyMs: 140,
      beforeState: { mmAlamRoad: 'flooded' },
      afterState: { mmAlamRoad: 'diverted_via_gulberg3' },
      trace: [
        { step: 1, phase: 'Planning', observation: 'MM Alam Road impassable', inference: 'Gulberg III boulevard is closest alternate', decision: 'Activate diversion via Gulberg III + Ferozepur Road', toolCalled: 'traffic_api', toolResult: 'Routes pushed to Google Maps + Waze', timestamp: now() },
      ],
    },
    {
      id: 'lhr-a5',
      crisisId: 'lhr-c1',
      type: 'hospital_notify',
      title: 'Alert Services + Jinnah + Shaukat Khanum for Respiratory Surge',
      description: 'Notify major Lahore hospitals to prepare respiratory ward capacity for smog-related admissions.',
      status: 'recovered',
      executedAt: now(),
      result: 'Hospital alert delivered via email fallback after API rate-limit.',
      costPKR: 0,
      latencyMs: 1820,
      beforeState: { hospitalAlert: 'none' },
      afterState: { hospitalAlert: 'active', method: 'email_fallback' },
      trace: [
        { step: 1, phase: 'Attempt 1', observation: 'POST /alerts to Punjab Health Management System', inference: 'API should respond in < 2s', decision: 'Send alert', toolCalled: 'health_api', toolResult: 'HTTP 429 Rate Limit Exceeded', timestamp: now() },
        { step: 2, phase: 'Retry', observation: 'Rate-limited on primary channel', inference: 'Hospital API is throttling during city-wide emergency', decision: 'Wait 800ms and retry', toolCalled: 'health_api', toolResult: 'HTTP 429 again', timestamp: now() },
        { step: 3, phase: 'Recovery', observation: 'Primary API unavailable', inference: 'Use email fallback to hospital emergency coordinators', decision: 'Send via email to Services, Jinnah, Shaukat Khanum coordinators', toolCalled: 'email_service', toolResult: 'Emails delivered to 3 hospitals', timestamp: now() },
        { step: 4, phase: 'Complete', observation: 'Fallback delivery confirmed', inference: 'Recovery successful', decision: 'Mark as recovered — flag API for review', timestamp: now() },
      ],
    },
  ];
}

export function getLahoreMessages(): StakeholderMessage[] {
  return [
    {
      audience: 'public',
      channel: 'sms',
      subject: '🔴 SMOG EMERGENCY — AQI 523 Lahore',
      body: 'Lahore AQI 523 (Hazardous). Ghar ke andar rahain. N95 mask zaroor pahnen. Schools band hain. Saans ki takleef pe foran hospital jayain. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'emergency_services',
      channel: 'dashboard',
      subject: 'DEPLOY: Smog Response + Liberty Flood',
      body: 'PGMI Punjab-3 → Canal Road respiratory surge. Rescue 1122-8 → Liberty Market flood. Traffic TP-22 → MM Alam Road diversion. WASA LP-03 → dewatering Hussain Chowk.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'hospitals',
      channel: 'email',
      subject: 'RESPIRATORY SURGE ALERT — Smog AQI 523',
      body: 'Services + Jinnah + Shaukat Khanum: Prepare respiratory ward capacity. AQI 523 city-wide. Expect surge in paediatric + elderly respiratory cases. PGMI mobile unit deployed. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'media',
      channel: 'email',
      subject: 'ADVISORY: Lahore Smog Emergency — Crop Burning Confirmed',
      body: 'AQI 523 confirmed by Punjab EPA. Primary cause: crop burning on city outskirts. Schools closed. Residents advised to stay indoors. CIRO coordinating health response.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
  ];
}
