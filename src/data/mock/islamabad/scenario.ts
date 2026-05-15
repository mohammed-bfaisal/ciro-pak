import type { Crisis, Action, StakeholderMessage } from '../../../types';

const now = () => new Date().toISOString();

export function getIslamabadCrises(): Crisis[] {
  return [
    {
      id: 'isb-c1',
      type: 'infrastructure',
      title: 'G-10 Markaz Road Collapse — Sinkhole',
      location: {
        lat: 33.6912,
        lng: 73.0152,
        label: 'G-10 Markaz, Islamabad',
        affectedRadiusKm: 1.0,
      },
      severity: 'high',
      confidenceScore: 0.90,
      confidenceHistory: [
        { t: '09:15', v: 0.58 },
        { t: '09:22', v: 0.72 },
        { t: '09:30', v: 0.80 },
        { t: '09:40', v: 0.90 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T09:15:00Z',
      estimatedDuration: '24-48 hours',
      affectedPopulation: 8000,
      spreadRisk: 'contained',
      signalIds: ['isb-s1', 'isb-s2', 'isb-f1', 'isb-t1'],
      conflictingSignalIds: ['isb-s3'],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• isb-s1 (social, credibility 0.71): Reports road collapse at G-10 markaz with Urdu urgency language. Strong velocity (14/min).
• isb-s2 (social, credibility 0.76): Confirms sinkhole ~4m wide with traffic completely blocked. High engagement (267 interactions).
• isb-s3 (social, credibility 0.10): FLAGGED — Claims only a small pothole. Posted 25 minutes BEFORE detailed reports, 1 like, 0 retweets, zero velocity. DOWN-RANKED as stale and unverified.
• isb-f1 (field_report, credibility 0.93): CDA engineering confirms 4.2m sinkhole, 2.8m deep, caused by burst water main. 2 vehicles affected. Area cordoned.
• isb-t1 (traffic, credibility 0.80): Khayaban-e-Iqbal speed at 2km/h (normal 45km/h) confirms major blockage.

Severity: HIGH — infrastructure failure, vehicles affected, major artery blocked.
Confidence: 0.90 — field verification from CDA engineering + corroborating traffic data.`,
      actions: [],
      stakeholderMessages: [],
      city: 'islamabad',
    },
    {
      id: 'isb-c2',
      type: 'disease_cluster',
      title: 'I-8/I-9 Severe Smog — Respiratory Emergency',
      location: {
        lat: 33.6700,
        lng: 73.0800,
        label: 'I-8/I-9 Sector, Islamabad',
        affectedRadiusKm: 4.0,
      },
      severity: 'high',
      confidenceScore: 0.86,
      confidenceHistory: [
        { t: '10:00', v: 0.52 },
        { t: '10:20', v: 0.72 },
        { t: '10:30', v: 0.86 },
      ],
      status: 'active',
      detectedAt: '2026-05-20T10:00:00Z',
      estimatedDuration: '12-24 hours',
      affectedPopulation: 45000,
      spreadRisk: 'expanding',
      signalIds: ['isb-s4', 'isb-s5', 'isb-f2', 'isb-w1'],
      conflictingSignalIds: [],
      verificationStatus: 'verified',
      agentReasoning: `Signal Fusion Analysis:
• isb-s4 (social, credibility 0.66): Reports severe smog in I-8 with breathing difficulties. Calls for school closures.
• isb-s5 (social, credibility 0.72): Hospital source reports children admitted with respiratory issues from I-8/I-9.
• isb-f2 (field_report, credibility 0.92): EPA confirms AQI 412 at I-8/I-9 junction. Visibility below 500m. Recommends school closures.
• isb-w1 (weather, credibility 0.85): Light winds (5km/h) explain poor pollutant dispersion.

Severity: HIGH — AQI 412 (hazardous), children hospitalised, expanding to I-10.
Confidence: 0.86 — EPA verification + hospital reports + weather corroboration.`,
      actions: [],
      stakeholderMessages: [],
      city: 'islamabad',
    },
  ];
}

export function getIslamabadActions(): Action[] {
  return [
    {
      id: 'isb-a1',
      crisisId: 'isb-c1',
      type: 'emergency_dispatch',
      title: 'Deploy Rescue + Traffic Control to G-10 Sinkhole',
      description: 'Dispatch rescue team to extract vehicles and traffic police to manage diversions around G-10 Markaz.',
      status: 'completed',
      executedAt: now(),
      result: '2 units dispatched. ETA 10 minutes.',
      costPKR: 35000,
      latencyMs: 280,
      beforeState: { rescueUnitsAvailable: 1, trafficUnitsAvailable: 1 },
      afterState: { rescueUnitsAvailable: 0, trafficUnitsAvailable: 0, unitsDispatched: 2 },
      trace: [
        { step: 1, phase: 'Planning', observation: 'Sinkhole with trapped vehicles', inference: 'Rescue + traffic control needed', decision: 'Dispatch NDMA Charlie + Traffic T-06', timestamp: now() },
        { step: 2, phase: 'Execution', observation: 'Units available and close', inference: 'Route via Margalla Road', decision: 'Dispatch both units', toolCalled: 'dispatch_api', toolResult: 'Units dispatched — ETA 10min', timestamp: now() },
      ],
    },
    {
      id: 'isb-a2',
      crisisId: 'isb-c1',
      type: 'utility_escalate',
      title: 'CDA Emergency Water Main Repair',
      description: 'Escalate burst water main repair to CDA priority. Sinkhole will worsen without fixing the underlying cause.',
      status: 'completed',
      executedAt: now(),
      result: 'CDA water department team dispatched. Estimated fix: 6 hours.',
      costPKR: 0,
      latencyMs: 120,
      beforeState: { waterMainStatus: 'burst' },
      afterState: { waterMainStatus: 'repair_in_progress', estimatedFix: '6 hours' },
      trace: [
        { step: 1, phase: 'Escalation', observation: 'Burst water main causing sinkhole', inference: 'Must fix root cause', decision: 'Escalate to CDA water department', toolCalled: 'utility_api', toolResult: 'CDA team dispatched', timestamp: now() },
      ],
    },
    {
      id: 'isb-a3',
      crisisId: 'isb-c1',
      type: 'traffic_reroute',
      title: 'G-10 Traffic Diversion via 7th Avenue',
      description: 'Reroute Khayaban-e-Iqbal traffic via 7th Avenue and Ataturk Avenue to bypass sinkhole.',
      status: 'completed',
      executedAt: now(),
      result: 'Diversion routes activated on navigation apps.',
      costPKR: 0,
      latencyMs: 150,
      beforeState: { khayabanIqbal: 'blocked' },
      afterState: { khayabanIqbal: 'diverted_via_7th_avenue' },
      trace: [
        { step: 1, phase: 'Planning', observation: 'Major artery blocked', inference: 'Need alternate routes', decision: 'Activate diversion via 7th Avenue', toolCalled: 'traffic_api', toolResult: 'Diversion routes pushed to navigation apps', timestamp: now() },
      ],
    },
    {
      id: 'isb-a4',
      crisisId: 'isb-c2',
      type: 'public_alert',
      title: 'Smog Health Advisory — I-8/I-9/I-10',
      description: 'Issue health advisory for hazardous AQI. Advise staying indoors, school closures, mask usage.',
      status: 'completed',
      executedAt: now(),
      result: 'Advisory SMS sent to 60,000 residents in I-sector.',
      costPKR: 30000,
      latencyMs: 190,
      beforeState: { healthAdvisory: 'none' },
      afterState: { healthAdvisory: 'active', residentsNotified: 60000 },
      trace: [
        { step: 1, phase: 'Drafting', observation: 'AQI 412 — hazardous', inference: 'Public health emergency', decision: 'Draft bilingual advisory', toolCalled: 'sms_gateway', toolResult: '60,000 SMS queued', timestamp: now() },
      ],
    },
    {
      id: 'isb-a5',
      crisisId: 'isb-c2',
      type: 'emergency_dispatch',
      title: 'Deploy Medical Unit to I-8 for Respiratory Cases',
      description: 'Send PIMS mobile health unit to I-8 sector for on-site treatment of respiratory cases.',
      status: 'completed',
      executedAt: now(),
      result: 'PIMS mobile unit dispatched. ETA 15 minutes.',
      costPKR: 25000,
      latencyMs: 230,
      beforeState: { medicalUnitsAvailable: 1 },
      afterState: { medicalUnitsAvailable: 0, medicalUnitDispatched: true },
      trace: [
        { step: 1, phase: 'Assessment', observation: 'Children hospitalised, AQI hazardous', inference: 'On-site respiratory care needed', decision: 'Deploy PIMS mobile unit with nebulisers and oxygen', toolCalled: 'dispatch_api', toolResult: 'Unit dispatched — ETA 15min', timestamp: now() },
      ],
    },
    {
      id: 'isb-a6',
      crisisId: 'isb-c1',
      type: 'alert_retraction',
      title: 'Correct Scope: Not Road Collapse — Sinkhole from Water Main',
      description: 'Initial social reports suggested road collapse. CDA confirms it is a sinkhole caused by burst water main. Retract incorrect classification.',
      status: 'completed',
      executedAt: now(),
      result: 'Correction sent. Updated to infrastructure/water main failure.',
      costPKR: 5000,
      latencyMs: 110,
      beforeState: { classification: 'road_collapse' },
      afterState: { classification: 'sinkhole_water_main', correctionSent: true },
      trace: [
        { step: 1, phase: 'Review', observation: 'Initial classification: road collapse', inference: 'CDA field report says water main burst causing sinkhole', decision: 'Issue correction to accurate classification', timestamp: now() },
      ],
    },
    {
      id: 'isb-a7',
      crisisId: 'isb-c2',
      type: 'hospital_notify',
      title: 'Alert PIMS + Shifa for Respiratory Surge',
      description: 'Notify hospitals to prepare respiratory care capacity for smog-related admissions.',
      status: 'recovered',
      executedAt: now(),
      result: 'Hospital notification sent via fallback email after API timeout.',
      costPKR: 0,
      latencyMs: 1650,
      beforeState: { hospitalAlert: 'none' },
      afterState: { hospitalAlert: 'active', method: 'email_fallback' },
      trace: [
        { step: 1, phase: 'Attempt 1', observation: 'POST /alerts to Hospital Management System', inference: 'API should respond', decision: 'Send alert', toolCalled: 'hospital_api', toolResult: 'HTTP 504 Gateway Timeout', timestamp: now() },
        { step: 2, phase: 'Retry', observation: 'Timeout on attempt 1', inference: 'Hospital API under load during emergency', decision: 'Retry with 500ms backoff', toolCalled: 'hospital_api', toolResult: 'HTTP 504 again', timestamp: now() },
        { step: 3, phase: 'Recovery', observation: 'API consistently failing', inference: 'Use email fallback channel', decision: 'Send alert via email to hospital emergency coordinators', toolCalled: 'email_service', toolResult: 'Email delivered to PIMS + Shifa coordinators', timestamp: now() },
        { step: 4, phase: 'Complete', observation: 'Fallback delivery confirmed', inference: 'Recovery successful via alternate channel', decision: 'Mark as recovered, flag API for ops review', timestamp: now() },
      ],
    },
  ];
}

export function getIslamabadMessages(): StakeholderMessage[] {
  return [
    {
      audience: 'public',
      channel: 'sms',
      subject: '⚠️ G-10 Markaz Sinkhole — Avoid Area',
      body: 'G-10 Markaz: Sinkhole on Khayaban-e-Iqbal. Avoid area. Use 7th Avenue / Ataturk Avenue. CDA repair underway. — CIRO Emergency System',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'public',
      channel: 'sms',
      subject: '🟠 HEALTH ADVISORY: Hazardous Smog I-8/I-9/I-10',
      body: 'AQI 412 (Hazardous) in I-8/I-9/I-10. Stay indoors. Wear N95 masks outside. Schools advised to close. Seek medical help for breathing difficulty. — CIRO',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'emergency_services',
      channel: 'dashboard',
      subject: 'DISPATCH: G-10 Sinkhole + I-8 Smog Response',
      body: 'NDMA Charlie → G-10 sinkhole. Traffic T-06 → G-10 diversion. PIMS Mobile → I-8 respiratory cases. Coordinate with CDA on-site.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'hospitals',
      channel: 'email',
      subject: 'RESPIRATORY SURGE ALERT: Smog Emergency',
      body: 'PIMS + Shifa: Prepare respiratory care capacity. AQI 412 in I-8/I-9/I-10. Expect surge in paediatric respiratory cases. PIMS mobile unit deployed.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'utility_company',
      channel: 'dashboard',
      subject: 'PRIORITY: G-10 Water Main Burst Repair',
      body: 'CDA Water Department: Burst water main at G-10 Markaz causing 4.2m sinkhole. Priority repair requested. Current status: repair_in_progress.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: false,
    },
    {
      audience: 'media',
      channel: 'email',
      subject: 'CORRECTION: G-10 Incident — Sinkhole from Water Main, Not Road Collapse',
      body: 'The G-10 Markaz incident is a sinkhole caused by a burst water main, NOT a general road collapse. 4.2m diameter, 2 vehicles affected, no casualties. CDA repair underway.',
      sentAt: now(),
      status: 'delivered',
      isRetraction: true,
    },
  ];
}
